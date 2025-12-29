package com.seikyuuressha.lms.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("hieu.dhm172808@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Mã xác nhận đặt lại mật khẩu - LMS Platform");
        message.setText(buildResetEmailContent(resetCode));
        
        mailSender.send(message);
    }
    
    private String buildResetEmailContent(String resetCode) {
        return String.format("""
                Xin chào,
                
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản LMS Platform của mình.
                
                Mã xác nhận của bạn là: %s
                
                Mã này sẽ hết hạn sau 15 phút.
                
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                
                Trân trọng,
                LMS Platform Team
                """, resetCode);
    }
}
