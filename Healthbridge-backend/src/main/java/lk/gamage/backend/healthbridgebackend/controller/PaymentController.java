package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.PaymentConfirmRequest;
import lk.gamage.backend.healthbridgebackend.dto.PaymentRequest;
import lk.gamage.backend.healthbridgebackend.dto.PaymentResponse;
import lk.gamage.backend.healthbridgebackend.model.Payment;
import lk.gamage.backend.healthbridgebackend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;

    // ============================================================
    // INITIATE PAYMENT
    // ============================================================
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @Valid @RequestBody PaymentRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors()
                    .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Validation failed", "errors", errors));
        }

        try {
            Payment payment = paymentService.initiatePayment(request);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Payment initiated. A 6-digit confirmation code has been sent to your registered email.");
            resp.put("paymentId", payment.getId());
            resp.put("maskedCard", payment.getMaskedCardNumber());
            resp.put("amount", payment.getAmount());
            resp.put("status", payment.getStatus());
            boolean emailSent = Boolean.TRUE.equals(payment.getEmailSent());
            resp.put("emailSent", emailSent);
            if (!emailSent && payment.getConfirmationCode() != null) {
                resp.put("devOtp", payment.getConfirmationCode());
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error initiating payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred"));
        }
    }

    // ============================================================
    // CONFIRM PAYMENT (with code)
    // ============================================================
    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmPayment(
            @PathVariable String id,
            @Valid @RequestBody PaymentConfirmRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter a valid 6-digit confirmation code"));
        }

        try {
            Payment payment = paymentService.confirmPayment(id, request.getConfirmationCode());
            return ResponseEntity.ok(Map.of(
                    "message", "Payment confirmed successfully!",
                    "paymentId", payment.getId(),
                    "status", payment.getStatus(),
                    "confirmedAt", payment.getConfirmedAt().toString(),
                    "amount", payment.getAmount()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error confirming payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Payment confirmation failed"));
        }
    }

    // ============================================================
    // SIMPLE CONFIRM (no code)
    // ============================================================
    @PostMapping("/confirm/{paymentId}")
    public ResponseEntity<PaymentResponse> confirmPaymentSimple(
            @PathVariable String paymentId) {
        try {
            Payment payment = paymentService.confirm(paymentId);
            return ResponseEntity.ok(paymentService.mapToResponse(payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============================================================
    // CANCEL PAYMENT
    // ============================================================
    @PostMapping("/cancel/{paymentId}")
    public ResponseEntity<PaymentResponse> cancelPayment(
            @PathVariable String paymentId) {
        try {
            Payment payment = paymentService.cancel(paymentId);
            return ResponseEntity.ok(paymentService.mapToResponse(payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============================================================
    // GET ALL PAYMENTS
    // ============================================================
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        try {
            List<PaymentResponse> payments = paymentService.getAllPayments().stream()
                    .map(paymentService::mapToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            log.error("Error getting all payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================
    // GET PAYMENTS BY PATIENT
    // ============================================================
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPaymentsByPatient(@PathVariable String patientId) {
        try {
            List<Payment> payments = paymentService.getPaymentsByPatient(patientId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve payments"));
        }
    }

    // ============================================================
    // GET PAYMENT BY ID
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable String id) {
        try {
            Payment payment = paymentService.getPaymentById(id);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve payment"));
        }
    }

    // ============================================================
    // MAPPER HELPER
    // ============================================================
    private PaymentResponse mapToResponse(Payment payment) {
        return paymentService.mapToResponse(payment);
    }
}