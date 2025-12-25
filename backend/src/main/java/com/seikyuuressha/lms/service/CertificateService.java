package com.seikyuuressha.lms.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.seikyuuressha.lms.dto.response.CertificateResponse;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.mapper.CertificateMapper;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final CertificateMapper certificateMapper;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Transactional
    public CertificateResponse generateCertificate(UUID courseId) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if enrolled
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Not enrolled in this course"));

        // Calculate progress dynamically (lessons with >= 80% watched)
        List<Lesson> allLessons = lessonRepository.findByCourseId(courseId);
        int totalLessons = allLessons.size();
        
        long completedLessons = allLessons.stream()
                .filter(lesson -> {
                    Progress progress = progressRepository
                            .findByUser_UserIdAndLesson_LessonId(userId, lesson.getLessonId())
                            .orElse(null);
                    return progress != null && progress.getProgressPercent() >= 80;
                })
                .count();

        double progressPercent = totalLessons > 0 
                ? (double) completedLessons / totalLessons * 100 
                : 0.0;

        // Check if course is completed (>= 90%)
        if (progressPercent < 90.0) {
            throw new RuntimeException("Course not completed yet. Required: 90% progress. Current: " + Math.round(progressPercent) + "%");
        }

        // Check if certificate already exists
        if (certificateRepository.findByUserAndCourse(user, course).isPresent()) {
            throw new RuntimeException("Certificate already generated for this course");
        }

        // Calculate final score (average of all lesson progress)
        List<Progress> progresses = progressRepository.findProgressByCourseAndUser(courseId, userId);
        Double finalScore = progresses.isEmpty() ? 0.0 
                : progresses.stream()
                        .mapToDouble(Progress::getProgressPercent)
                        .average()
                        .orElse(0.0);

        // Generate certificate code
        String certificateCode = generateCertificateCode();

        // Generate PDF and upload to S3
        String s3Key = "certificates/" + certificateCode + ".pdf";
        
        try {
            byte[] pdfBytes = createCertificatePDF(user, course, certificateCode, finalScore);
            
            // Upload to S3
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .contentType("application/pdf")
                            .build(),
                    RequestBody.fromBytes(pdfBytes)
            );
            
            log.info("Certificate PDF uploaded to S3: {}", s3Key);
        } catch (Exception e) {
            log.error("Failed to generate/upload certificate PDF", e);
            throw new RuntimeException("Failed to generate certificate PDF: " + e.getMessage());
        }

        // Save certificate record with S3 key
        Certificate certificate = Certificate.builder()
                .user(user)
                .course(course)
                .certificateCode(certificateCode)
                .pdfUrl(s3Key)  // Store S3 key instead of URL
                .finalScore(finalScore)
                .isValid(true)
                .build();

        certificate = certificateRepository.save(certificate);
        
        // Return response with presigned URL
        CertificateResponse response = certificateMapper.toCertificateResponse(certificate);
        response.setPdfUrl(generatePresignedUrl(s3Key));
        return response;
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getMyCertificates() {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Certificate> certificates = certificateRepository.findByUserOrderByIssuedAtDesc(user);
        return certificates.stream()
                .map(cert -> {
                    CertificateResponse response = certificateMapper.toCertificateResponse(cert);
                    if (cert.getPdfUrl() != null) {
                        response.setPdfUrl(generatePresignedUrl(cert.getPdfUrl()));
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByCourse(UUID courseId) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Certificate certificate = certificateRepository.findByUserAndCourse(user, course)
                .orElse(null);

        if (certificate == null) {
            return null;
        }

        CertificateResponse response = certificateMapper.toCertificateResponse(certificate);
        if (certificate.getPdfUrl() != null) {
            response.setPdfUrl(generatePresignedUrl(certificate.getPdfUrl()));
        }
        return response;
    }

    private String generatePresignedUrl(String s3Key) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Key)
                        .build())
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private byte[] createCertificatePDF(Users user, Course course,
                                        String certificateCode, Double finalScore) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        
        // Set landscape page size
        pdfDoc.setDefaultPageSize(com.itextpdf.kernel.geom.PageSize.A4.rotate());
        Document document = new Document(pdfDoc);
        document.setMargins(40, 60, 40, 60);

        // Get page dimensions
        float pageWidth = pdfDoc.getDefaultPageSize().getWidth();
        float pageHeight = pdfDoc.getDefaultPageSize().getHeight();

        // Draw gradient background
        com.itextpdf.kernel.pdf.canvas.PdfCanvas canvas = new com.itextpdf.kernel.pdf.canvas.PdfCanvas(pdfDoc.addNewPage());
        
        // Purple gradient effect (draw multiple rectangles)
        com.itextpdf.kernel.colors.DeviceRgb darkPurple = new com.itextpdf.kernel.colors.DeviceRgb(45, 27, 105);
        com.itextpdf.kernel.colors.DeviceRgb mediumPurple = new com.itextpdf.kernel.colors.DeviceRgb(88, 28, 135);
        
        canvas.saveState();
        canvas.setFillColor(darkPurple);
        canvas.rectangle(0, 0, pageWidth, pageHeight);
        canvas.fill();
        
        // Add decorative corner triangles
        canvas.setFillColor(mediumPurple);
        canvas.moveTo(0, pageHeight);
        canvas.lineTo(200, pageHeight);
        canvas.lineTo(0, pageHeight - 150);
        canvas.closePathFillStroke();
        
        canvas.moveTo(pageWidth, 0);
        canvas.lineTo(pageWidth - 200, 0);
        canvas.lineTo(pageWidth, 150);
        canvas.closePathFillStroke();
        canvas.restoreState();

        // Draw border
        com.itextpdf.kernel.colors.DeviceRgb gold = new com.itextpdf.kernel.colors.DeviceRgb(212, 175, 55);
        canvas.saveState();
        canvas.setStrokeColor(gold);
        canvas.setLineWidth(3);
        canvas.rectangle(30, 30, pageWidth - 60, pageHeight - 60);
        canvas.stroke();
        canvas.restoreState();

        // Fonts
        PdfFont boldFont = PdfFontFactory.createFont();
        PdfFont regularFont = PdfFontFactory.createFont();

        // Gold medal/ribbon symbol using Unicode
        Paragraph medal = new Paragraph("🏆")
                .setFontSize(60)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20);
        document.add(medal);

        // "CERTIFICATE" title
        Paragraph certTitle = new Paragraph("CERTIFICATE")
                .setFont(boldFont)
                .setFontSize(48)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(gold)
                .setMarginTop(-20);
        document.add(certTitle);

        // "OF COMPLETION" subtitle
        Paragraph ofCompletion = new Paragraph("OF COMPLETION")
                .setFont(regularFont)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.WHITE)
                .setMarginTop(5);
        document.add(ofCompletion);

        // Decorative line
        Paragraph line1 = new Paragraph("─────────────────────")
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(gold)
                .setMarginTop(15);
        document.add(line1);

        // "This certifies that"
        Paragraph thisCertifies = new Paragraph("This certifies that")
                .setFont(regularFont)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.LIGHT_GRAY)
                .setMarginTop(15);
        document.add(thisCertifies);

        // Student name
        Paragraph studentName = new Paragraph(user.getFullName())
                .setFont(boldFont)
                .setFontSize(36)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.WHITE)
                .setMarginTop(10);
        document.add(studentName);

        // "has successfully completed the course"
        Paragraph hasCompleted = new Paragraph("has successfully completed the course")
                .setFont(regularFont)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.LIGHT_GRAY)
                .setMarginTop(15);
        document.add(hasCompleted);

        // Course title
        Paragraph courseTitle = new Paragraph(course.getTitle())
                .setFont(boldFont)
                .setFontSize(28)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(gold)
                .setMarginTop(10);
        document.add(courseTitle);

        // Score badge
        Paragraph scoreBadge = new Paragraph(String.format("Score: %.0f%%", finalScore))
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.WHITE)
                .setMarginTop(20);
        document.add(scoreBadge);

        // Bottom section with date and signature
        String dateStr = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        
        // Create a table for bottom section
        com.itextpdf.layout.element.Table bottomTable = new com.itextpdf.layout.element.Table(2);
        bottomTable.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(80));
        bottomTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
        bottomTable.setMarginTop(30);
        
        // Date cell
        com.itextpdf.layout.element.Cell dateCell = new com.itextpdf.layout.element.Cell()
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .add(new Paragraph("_____________________")
                        .setFontColor(gold)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(12))
                .add(new Paragraph(dateStr)
                        .setFontColor(ColorConstants.WHITE)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10))
                .add(new Paragraph("Date")
                        .setFontColor(ColorConstants.LIGHT_GRAY)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10));
        bottomTable.addCell(dateCell);
        
        // Signature cell
        com.itextpdf.layout.element.Cell signatureCell = new com.itextpdf.layout.element.Cell()
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .add(new Paragraph("_____________________")
                        .setFontColor(gold)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(12))
                .add(new Paragraph("LMS Platform")
                        .setFontColor(ColorConstants.WHITE)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10))
                .add(new Paragraph("Signature")
                        .setFontColor(ColorConstants.LIGHT_GRAY)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10));
        bottomTable.addCell(signatureCell);
        
        document.add(bottomTable);

        // Certificate code at bottom
        Paragraph codeText = new Paragraph("Certificate ID: " + certificateCode)
                .setFont(regularFont)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setMarginTop(20);
        document.add(codeText);

        document.close();
        return baos.toByteArray();
    }

    private String generateCertificateCode() {
        String year = String.valueOf(OffsetDateTime.now().getYear());
        String randomPart = String.format("%06d", (int) (Math.random() * 1000000));
        return "LMS-" + year + "-" + randomPart;
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = authentication.getName();
        
        try {
            return UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            Users user = userRepository.findByEmail(userIdStr)
                    .orElseThrow(() -> new RuntimeException("User not found by email/id: " + userIdStr));
            return user.getUserId();
        }
    }
}
