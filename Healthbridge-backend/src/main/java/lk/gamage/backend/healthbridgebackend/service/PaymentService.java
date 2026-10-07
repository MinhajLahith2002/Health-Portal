package lk.gamage.backend.healthbridgebackend.service;

// ✅ CORRECT IMPORTS
import lk.gamage.backend.healthbridgebackend.dto.PaymentRequest;
import lk.gamage.backend.healthbridgebackend.dto.PaymentResponse;   // ✅ FIXED (was dto.response)
import lk.gamage.backend.healthbridgebackend.model.Payment;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.PaymentRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BillingIntegrationService billingIntegrationService;

    private final SecureRandom secureRandom = new SecureRandom();

    // ============================================================
    // INITIATE PAYMENT
    // ============================================================
    public Payment initiatePayment(PaymentRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        String cleanCardNumber = request.getCardNumber().replaceAll("[\\s-]", "");
        if (!cleanCardNumber.matches("\\d{13,19}")) {
            throw new IllegalArgumentException("Invalid card number format");
        }
        if (!request.getExpiryDate().matches("(0[1-9]|1[0-2])/\\d{2}")) {
            throw new IllegalArgumentException("Invalid expiry date format. Use MM/YY");
        }
        if (!request.getCvv().matches("\\d{3,4}")) {
            throw new IllegalArgumentException("Invalid CVV format");
        }

        String lastFour = cleanCardNumber.substring(cleanCardNumber.length() - 4);
        String maskedCard = "****-****-****-" + lastFour;

        int code = 100000 + secureRandom.nextInt(900000);
        String confirmationCode = String.valueOf(code);

        Payment payment = Payment.builder()
                .patientId(patient.getId())
                .patientEmail(patient.getEmail())
                .patientName(patient.getFullName())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "OTHER")
                .amount(request.getAmount())
                .cardHolderName(request.getCardHolderName())
                .maskedCardNumber(maskedCard)
                .confirmationCode(confirmationCode)
                .codeExpiresAt(LocalDateTime.now().plusMinutes(10))
                .status("PENDING_CONFIRMATION")
                .createdAt(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("[Payment] Initiated {} for {} ({}), amount: {}",
                savedPayment.getId(), patient.getFullName(),
                patient.getEmail(), request.getAmount());

        boolean emailSent = emailService.sendPaymentConfirmationEmail(
                patient.getEmail(),
                confirmationCode,
                request.getAmount().toPlainString(),
                request.getDescription()
        );
        savedPayment.setEmailSent(emailSent);
        return paymentRepository.save(savedPayment);
    }

    // ============================================================
    // CONFIRM PAYMENT (with code)
    // ============================================================
    public Payment confirmPayment(String paymentId, String confirmationCode) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if ("CONFIRMED".equals(payment.getStatus())) {
            throw new IllegalArgumentException("This payment has already been confirmed");
        }

        if ("EXPIRED".equals(payment.getStatus()) ||
                payment.getCodeExpiresAt().isBefore(LocalDateTime.now())) {
            payment.setStatus("EXPIRED");
            paymentRepository.save(payment);
            throw new IllegalArgumentException("Confirmation code has expired.");
        }

        if (!payment.getConfirmationCode().equals(confirmationCode.trim())) {
            throw new IllegalArgumentException("Invalid confirmation code");
        }

        payment.setStatus("CONFIRMED");
        payment.setConfirmedAt(LocalDateTime.now());
        payment.setConfirmationCode(null);

        Payment confirmedPayment = paymentRepository.save(payment);
        log.info("[Payment] {} CONFIRMED for {}", paymentId, payment.getPatientEmail());

        // ✅ Notify Billing Service
        try {
            billingIntegrationService.onPaymentConfirmed(
                    confirmedPayment.getPatientId(),
                    confirmedPayment.getAmount(),
                    paymentId
            );
            log.info("[Payment → Billing] Notified for patient {}",
                    confirmedPayment.getPatientId());
        } catch (Exception e) {
            log.error("[Payment → Billing] Failed: {}", e.getMessage());
        }

        return confirmedPayment;
    }

    // ============================================================
    // SIMPLE CONFIRM
    // ============================================================
    public Payment confirm(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (!"CONFIRMED".equals(payment.getStatus())) {
            payment.setStatus("CONFIRMED");
            payment.setConfirmedAt(LocalDateTime.now());
            payment.setConfirmationCode(null);
            payment = paymentRepository.save(payment);

            try {
                billingIntegrationService.onPaymentConfirmed(
                        payment.getPatientId(),
                        payment.getAmount(),
                        paymentId
                );
            } catch (Exception e) {
                log.error("[Payment → Billing] Notification failed: {}", e.getMessage());
            }
        }

        return payment;
    }

    // ============================================================
    // CANCEL
    // ============================================================
    public Payment cancel(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        payment.setStatus("CANCELLED");
        return paymentRepository.save(payment);
    }

    // ============================================================
    // GET Methods
    // ============================================================
    public List<Payment> getPaymentsByPatient(String patientId) {
        return paymentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public Payment getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // ============================================================
    // ✅ PUBLIC MAPPER (not private)
    // ============================================================
    public PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .patientId(payment.getPatientId())
                .patientName(payment.getPatientName())
                .patientEmail(payment.getPatientEmail())
                .description(payment.getDescription())
                .category(payment.getCategory())
                .amount(payment.getAmount())
                .cardHolderName(payment.getCardHolderName())
                .maskedCardNumber(payment.getMaskedCardNumber())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .confirmedAt(payment.getConfirmedAt())
                .build();
    }
}