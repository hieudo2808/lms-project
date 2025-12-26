package com.seikyuuressha.lms.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Table;
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

        pdfDoc.setDefaultPageSize(PageSize.A4.rotate());
        Document document = new Document(pdfDoc);
        document.setMargins(0, 0, 0, 0);

        float width = pdfDoc.getDefaultPageSize().getWidth();
        float height = pdfDoc.getDefaultPageSize().getHeight();

        DeviceRgb bgDark = new DeviceRgb(20, 10, 40);
        DeviceRgb bgLight = new DeviceRgb(45, 27, 105);
        DeviceRgb goldColor = new DeviceRgb(255, 215, 0);
        DeviceRgb whiteColor = new DeviceRgb(255, 255, 255);
        DeviceRgb grayColor = new DeviceRgb(200, 200, 200);

        PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont textFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont nameFont = PdfFontFactory.createFont(StandardFonts.TIMES_BOLDITALIC);

        // 2. VẼ NỀN (BACKGROUND)
        PdfCanvas canvas = new PdfCanvas(pdfDoc.addNewPage());

        // Vẽ nền tối full trang
        canvas.saveState();
        canvas.setFillColor(bgDark);
        canvas.rectangle(0, 0, width, height);
        canvas.fill();

        // Vẽ họa tiết trang trí (Tam giác góc/Abstract shape)
        canvas.setFillColor(bgLight);
        canvas.moveTo(0, height);
        canvas.lineTo(width / 2, height);
        canvas.lineTo(0, 0);
        canvas.fill();
        canvas.restoreState();

        // 3. VẼ KHUNG VIỀN VÀNG (BORDER)
        float margin = 30;
        canvas.saveState();
        canvas.setStrokeColor(goldColor);
        canvas.setLineWidth(2);
        // Vẽ hình chữ nhật bo góc (x, y, w, h, radius)
        canvas.roundRectangle(margin, margin, width - (margin * 2), height - (margin * 2), 10);
        canvas.stroke();

        // Vẽ thêm một viền mỏng bên trong để tạo hiệu ứng kép
        canvas.setLineWidth(0.5f);
        canvas.roundRectangle(margin + 5, margin + 5, width - (margin * 2) - 10, height - (margin * 2) - 10, 8);
        canvas.stroke();
        canvas.restoreState();

        // 4. VẼ HUY HIỆU (BADGE) - Bên trái hoặc phải
        // Vẽ thủ công bằng code (Vòng tròn và ruy băng)
        drawGoldBadge(canvas, height - 120, goldColor, bgDark);

        // --- NỘI DUNG TEXT (Dùng Container/Div để căn chỉnh padding tốt hơn) ---
        Div contentDiv = new Div()
                .setMargins(40, 60, 40, 60)
                .setWidth(UnitValue.createPercentValue(100));

        // Logo / Brand Name nhỏ ở trên cùng
        Paragraph brandName = new Paragraph("LMS PLATFORM")
                .setFont(titleFont).setFontSize(12).setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER).setCharacterSpacing(2);
        contentDiv.add(brandName);

        // Tiêu đề chính "CERTIFICATE"
        Paragraph certTitle = new Paragraph("CERTIFICATE")
                .setFont(titleFont).setFontSize(50).setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER).setBold()
                .setMarginTop(20);
        contentDiv.add(certTitle);

        // "OF COMPLETION"
        Paragraph subTitle = new Paragraph("OF COMPLETION")
                .setFont(textFont).setFontSize(18).setFontColor(whiteColor)
                .setTextAlignment(TextAlignment.CENTER).setCharacterSpacing(5)
                .setMarginTop(-10);
        contentDiv.add(subTitle);

        // Dòng kẻ ngăn cách
        contentDiv.add(new Paragraph(" ")
                .setBorderBottom(new com.itextpdf.layout.borders.SolidBorder(goldColor, 1))
                .setWidth(200)
                .setHorizontalAlignment(HorizontalAlignment.CENTER)
                .setMarginTop(10)
                .setMarginBottom(10));

        // "This is to certify that"
        Paragraph introText = new Paragraph("This is to certify that")
                .setFont(textFont).setFontSize(14).setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER).setItalic();
        contentDiv.add(introText);

        // TÊN HỌC VIÊN (Lớn nhất)
        Paragraph studentNamePara = new Paragraph(user.getFullName().toUpperCase())
                .setFont(nameFont).setFontSize(32).setFontColor(whiteColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10).setMarginBottom(10);
        contentDiv.add(studentNamePara);

        // "Has successfully completed the course"
        Paragraph bodyText = new Paragraph("Has successfully completed the curriculum and requirements for the course:")
                .setFont(textFont).setFontSize(14).setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER);
        contentDiv.add(bodyText);

        // TÊN KHÓA HỌC
        Paragraph courseTitlePara = new Paragraph(course.getTitle())
                .setFont(titleFont).setFontSize(24).setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(5);
        contentDiv.add(courseTitlePara);

        // Điểm số (Option)
        Paragraph scorePara = new Paragraph(String.format("Final Grade: %.1f/100", finalScore))
                .setFont(textFont).setFontSize(12).setFontColor(grayColor)
                .setTextAlignment(TextAlignment.CENTER).setMarginTop(5);
        contentDiv.add(scorePara);

        // --- PHẦN CHỮ KÝ VÀ NGÀY (Dùng Table 2 cột) ---
        Table footerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        footerTable.setWidth(UnitValue.createPercentValue(80));
        footerTable.setHorizontalAlignment(HorizontalAlignment.CENTER);
        footerTable.setMarginTop(40);

        // Cột 1: Ngày tháng
        String dateStr = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        Cell dateCell = new Cell().add(new Paragraph(dateStr).setFont(titleFont).setFontSize(14).setFontColor(whiteColor).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("______________________").setFontColor(goldColor).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("Date Issued").setFont(textFont).setFontSize(10).setFontColor(grayColor).setTextAlignment(TextAlignment.CENTER))
                .setBorder(Border.NO_BORDER);

        // Cột 2: Chữ ký (Giả lập)
        Cell signCell = new Cell().add(new Paragraph("Do Hieu").setFont(nameFont).setFontSize(18).setFontColor(whiteColor).setTextAlignment(TextAlignment.CENTER).setItalic())
                .add(new Paragraph("______________________").setFontColor(goldColor).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("Instructor Signature").setFont(textFont).setFontSize(10).setFontColor(grayColor).setTextAlignment(TextAlignment.CENTER))
                .setBorder(Border.NO_BORDER);

        footerTable.addCell(dateCell);
        footerTable.addCell(signCell);
        contentDiv.add(footerTable);

        // Mã chứng chỉ nhỏ ở đáy
        Paragraph certIdPara = new Paragraph("Certificate ID: " + certificateCode)
                .setFont(textFont).setFontSize(8).setFontColor(new DeviceRgb(100, 100, 100));
        contentDiv.add(certIdPara);

        document.add(contentDiv);
        document.close();

        return baos.toByteArray();
    }

    private void drawGoldBadge(PdfCanvas canvas, float y, DeviceRgb gold, DeviceRgb dark) {
        canvas.saveState();

        // 1. Vẽ ruy băng đuôi (Ribbon tails)
        canvas.setFillColor(gold);
        // Đuôi trái
        canvas.moveTo((float) 100 - 15, y - 40);
        canvas.lineTo((float) 100 - 25, y - 80);
        canvas.lineTo((float) 100 - 5, y - 70);
        canvas.lineTo((float) 100 + 15, y - 80); // Đuôi phải
        canvas.lineTo((float) 100 + 5, y - 40);
        canvas.fill();

        // 2. Vẽ vòng tròn răng cưa (Starburst)
        float radius = 40;
        int rays = 24;
        double step = 2 * Math.PI / rays;
        canvas.setFillColor(gold);

        // Di chuyển đến điểm bắt đầu
        double startAngle = 0;
        canvas.moveTo((float) 100 + Math.cos(startAngle) * (radius + 5), y + Math.sin(startAngle) * (radius + 5));

        for (int i = 0; i < rays; i++) {
            double angle = i * step;
            double nextAngle = (i + 1) * step;
            double midAngle = (angle + nextAngle) / 2;

            // Đỉnh nhọn ra ngoài
            canvas.lineTo((float) 100 + Math.cos(midAngle) * (radius + 8), y + Math.sin(midAngle) * (radius + 8));
            // Đỉnh lùi vào trong
            canvas.lineTo((float) 100 + Math.cos(nextAngle) * (radius), y + Math.sin(nextAngle) * (radius));
        }
        canvas.fill();

        // 3. Vẽ vòng tròn chính bên trong
        canvas.setFillColor(gold);
        canvas.circle((float) 100, y, radius);
        canvas.fill();

        // 4. Vẽ viền tròn mỏng bên trong (tạo hiệu ứng dập nổi)
        canvas.setStrokeColor(dark);
        canvas.setLineWidth(1);
        canvas.circle((float) 100, y, radius - 5);
        canvas.stroke();

        // 5. Vẽ icon cuốn sách đơn giản ở giữa (Hoặc chữ A)
        canvas.setFillColor(dark);
        // Vẽ hình chữ nhật tượng trưng sách
        canvas.rectangle((float) 100 - 12, y - 10, 24, 20);
        canvas.fill();

        canvas.restoreState();
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
