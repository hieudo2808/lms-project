package com.seikyuuressha.lms.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.seikyuuressha.lms.dto.response.CertificateResponse;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
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

    @Value("${certificate.storage-path}")
    private String certificateStoragePath;

    @Value("${certificate.base-url}")
    private String certificateBaseUrl;

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

        // Check if course is completed
        if (enrollment.getProgressPercent() < 90.0f) {
            throw new RuntimeException("Course not completed yet. Required: 90% progress");
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

        // Generate PDF
        String pdfFileName = certificateCode + ".pdf";
        String pdfPath = certificateStoragePath + "/" + pdfFileName;
        String pdfUrl = certificateBaseUrl + "/" + pdfFileName;

        try {
            createCertificatePDF(pdfPath, user, course, certificateCode, finalScore);
        } catch (Exception e) {
            log.error("Failed to generate certificate PDF", e);
            throw new RuntimeException("Failed to generate certificate PDF");
        }

        // Save certificate record
        Certificate certificate = Certificate.builder()
                .user(user)
                .course(course)
                .certificateCode(certificateCode)
                .pdfUrl(pdfUrl)
                .finalScore(finalScore)
                .isValid(true)
                .build();

        certificate = certificateRepository.save(certificate);
        return mapToResponse(certificate);
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getMyCertificates() {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Certificate> certificates = certificateRepository.findByUserOrderByIssuedAtDesc(user);
        return certificates.stream()
                .map(this::mapToResponse)
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

        return certificate != null ? mapToResponse(certificate) : null;
    }

    private void createCertificatePDF(String filePath, Users user, Course course,
                                     String certificateCode, Double finalScore) throws Exception {
        // Ensure directory exists
        File directory = new File(certificateStoragePath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Create PDF
        PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // Add certificate content
        PdfFont boldFont = PdfFontFactory.createFont();
        PdfFont regularFont = PdfFontFactory.createFont();

        // Title
        Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION")
                .setFont(boldFont)
                .setFontSize(32)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.BLUE)
                .setMarginTop(100);
        document.add(title);

        // Subtitle
        Paragraph subtitle = new Paragraph("This is to certify that")
                .setFont(regularFont)
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(subtitle);

        // User name
        Paragraph userName = new Paragraph(user.getFullName())
                .setFont(boldFont)
                .setFontSize(28)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20)
                .setFontColor(ColorConstants.DARK_GRAY);
        document.add(userName);

        // Course completion text
        Paragraph completionText = new Paragraph("has successfully completed the course")
                .setFont(regularFont)
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(completionText);

        // Course title
        Paragraph courseTitle = new Paragraph(course.getTitle())
                .setFont(boldFont)
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20)
                .setFontColor(ColorConstants.BLUE);
        document.add(courseTitle);

        // Final score
        Paragraph score = new Paragraph(String.format("Final Score: %.2f%%", finalScore))
                .setFont(regularFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(score);

        // Date
        String dateStr = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        Paragraph date = new Paragraph("Date: " + dateStr)
                .setFont(regularFont)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(40);
        document.add(date);

        // Certificate code
        Paragraph code = new Paragraph("Certificate Code: " + certificateCode)
                .setFont(regularFont)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20)
                .setFontColor(ColorConstants.GRAY);
        document.add(code);

        document.close();
        log.info("Certificate PDF generated: {}", filePath);
    }

    private String generateCertificateCode() {
        String year = String.valueOf(OffsetDateTime.now().getYear());
        String randomPart = String.format("%06d", (int) (Math.random() * 1000000));
        return "LMS-" + year + "-" + randomPart;
    }

    private CertificateResponse mapToResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .certificateId(certificate.getCertificateId())
                .userId(certificate.getUser().getUserId())
                .courseId(certificate.getCourse().getCourseId())
                .certificateCode(certificate.getCertificateCode())
                .pdfUrl(certificate.getPdfUrl())
                .finalScore(certificate.getFinalScore())
                .issuedAt(certificate.getIssuedAt())
                .isValid(certificate.getIsValid())
                .revokedAt(certificate.getRevokedAt())
                .revocationReason(certificate.getRevokedReason())
                .build();
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = authentication.getName();
        
        try {
            // Token chứa UUID -> Parse trực tiếp
            return UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            // Fallback: Nếu token chứa email (trường hợp cũ)
            Users user = userRepository.findByEmail(userIdStr)
                    .orElseThrow(() -> new RuntimeException("User not found by email/id: " + userIdStr));
            return user.getUserId();
        }
    }
}
