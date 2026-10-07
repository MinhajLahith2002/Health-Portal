package lk.gamage.backend.healthbridgebackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:healthbridge012@gmail.com}")
    private String fromEmail;

    public boolean sendOtpEmail(String toEmail, String otp) {
        log.info("==================================================");
        log.info("[Health Bridge OTP Verification]");
        log.info("Sending OTP code: {} to {}", otp, toEmail);
        log.info("==================================================");

        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. OTP printed to console: {}", otp);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Health Bridge Security");
            helper.setTo(toEmail);
            helper.setSubject("Your Health Bridge Verification Code");

            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;\">"
                    + "<div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 24px;\">"
                    + "<h2 style=\"color: #1d4ed8; margin: 0; font-size: 24px;\">🏥 Health Bridge</h2>"
                    + "</div>"
                    + "<h3 style=\"color: #111827; font-size: 20px; margin-top: 0;\">Verify Your Identity</h3>"
                    + "<p style=\"color: #4b5563; font-size: 15px; line-height: 1.6;\">You have requested a verification code to access or reset your Health Bridge account. Use the 6-digit code below to proceed:</p>"
                    + "<div style=\"background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;\">"
                    + "<span style=\"font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #15803d; font-family: monospace;\">" + otp + "</span>"
                    + "</div>"
                    + "<p style=\"color: #6b7280; font-size: 13px;\">⏱️ This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;\" />"
                    + "<p style=\"color: #9ca3af; font-size: 12px; text-align: center; margin: 0;\">© 2026 Health Bridge. Secure Healthcare Management System.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP email successfully dispatched to {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("Failed to send OTP email via SMTP to {}. Reason: {}. Generated OTP is: {}", toEmail, e.getMessage(), otp);
            return false;
        }
    }

    public boolean sendPaymentConfirmationEmail(String toEmail, String code, String amount, String description) {
        log.info("==================================================");
        log.info("[Health Bridge Payment Confirmation]");
        log.info("Sending payment OTP: {} to {} for amount: Rs. {}", code, toEmail, amount);
        log.info("==================================================");

        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Payment OTP printed to console: {}", code);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Health Bridge Billing");
            helper.setTo(toEmail);
            helper.setSubject("Your Health Bridge Payment Confirmation Code: " + code);

            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "<h2 style=\"color: #0284c7; margin: 0; font-size: 24px;\">🏥 Health Bridge</h2>"
                    + "<p style=\"color: #6b7280; font-size: 14px; margin-top: 4px;\">Payment Security & Verification</p>"
                    + "</div>"
                    + "<h3 style=\"color: #111827; font-size: 20px; margin-top: 0;\">Confirm Your Payment</h3>"
                    + "<p style=\"color: #4b5563; font-size: 15px; line-height: 1.6;\">A payment request has been initiated for your account. Please use the 6-digit confirmation code below to complete the transaction:</p>"
                    + "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;\">"
                    + "<div style=\"display: flex; justify-content: space-between; margin-bottom: 8px;\">"
                    + "<span style=\"color: #64748b; font-size: 14px;\">Description:</span>"
                    + "<span style=\"color: #0f172a; font-weight: 600; font-size: 14px;\">" + description + "</span>"
                    + "</div>"
                    + "<div style=\"display: flex; justify-content: space-between;\">"
                    + "<span style=\"color: #64748b; font-size: 14px;\">Amount:</span>"
                    + "<span style=\"color: #0284c7; font-weight: 700; font-size: 16px;\">Rs. " + amount + "</span>"
                    + "</div>"
                    + "</div>"
                    + "<div style=\"background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;\">"
                    + "<div style=\"color: #1e40af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;\">One-Time Confirmation Code</div>"
                    + "<span style=\"font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: monospace;\">" + code + "</span>"
                    + "</div>"
                    + "<p style=\"color: #6b7280; font-size: 13px;\">⏱️ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone. If you did not initiate this payment, please contact Health Bridge support immediately.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;\">"
                    + "<p style=\"color: #9ca3af; font-size: 12px; text-align: center; margin: 0;\">© 2026 Health Bridge. Secure Healthcare Management System.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Payment confirmation email successfully dispatched to {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("Failed to send payment confirmation email via SMTP to {}. Reason: {}. Generated Code is: {}", toEmail, e.getMessage(), code);
            return false;
        }
    }
}

