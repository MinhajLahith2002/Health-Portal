package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.enums.InventoryStatus;
import lk.gamage.backend.healthbridgebackend.model.Inventory;
import lk.gamage.backend.healthbridgebackend.model.Invoice;
import lk.gamage.backend.healthbridgebackend.model.InsuranceClaim;
import lk.gamage.backend.healthbridgebackend.repository.InventoryRepository;
import lk.gamage.backend.healthbridgebackend.repository.InvoiceRepository;
import lk.gamage.backend.healthbridgebackend.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingIntegrationService {

    private final InvoiceRepository invoiceRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final InventoryRepository inventoryRepository;

    // ============================================================
    // ✅ Handle Payment Confirmation (from Dev 16)
    // ============================================================
    public void onPaymentConfirmed(String patientId, BigDecimal amount, String paymentId) {
        log.info("💰 [Billing] Payment received: {} for patient: {} amount: Rs. {}",
                paymentId, patientId, amount);

        if (patientId == null || amount == null) {
            log.warn("⚠️ [Billing] Invalid payment data");
            return;
        }

        List<Invoice> unpaidInvoices = invoiceRepository.findAll().stream()
                .filter(inv -> patientId.equals(inv.getPatientId()))
                .filter(inv -> "UNPAID".equals(inv.getPaymentStatus())
                        || "PARTIAL".equals(inv.getPaymentStatus()))
                .toList();

        if (unpaidInvoices.isEmpty()) {
            log.warn("⚠️ [Billing] No unpaid invoices for patient: {}", patientId);
            return;
        }

        BigDecimal remaining = amount;

        for (Invoice invoice : unpaidInvoices) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal balance = invoice.getBalance() != null
                    ? invoice.getBalance()
                    : BigDecimal.ZERO;
            BigDecimal toApply = remaining.min(balance);

            BigDecimal newPaid = (invoice.getPaidAmount() != null
                    ? invoice.getPaidAmount()
                    : BigDecimal.ZERO).add(toApply);

            invoice.setPaidAmount(newPaid);
            invoice.setPaymentId(paymentId);
            invoice.setBalance(balance.subtract(toApply));

            if (invoice.getBalance().compareTo(BigDecimal.ZERO) == 0) {
                invoice.setPaymentStatus("PAID");
                invoice.setStatus("PAID");
            } else {
                invoice.setPaymentStatus("PARTIAL");
            }

            invoiceRepository.save(invoice);
            log.info("✅ [Billing] Applied Rs. {} to invoice {}",
                    toApply, invoice.getInvoiceNumber());

            remaining = remaining.subtract(toApply);
        }
    }

    // ============================================================
    // ✅ Handle Insurance Claim Approval (from Dev 14)
    // ============================================================
    public void onInsuranceClaimApproved(String claimId, Double approvedAmount) {
        log.info("🏥 [Billing] Insurance claim approved: {} for Rs. {}",
                claimId, approvedAmount);

        InsuranceClaim claim = insuranceClaimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found: " + claimId));

        invoiceRepository.findAll().stream()
                .filter(inv -> claim.getPatientId().equals(inv.getPatientId()))
                .filter(inv -> !"PAID".equals(inv.getPaymentStatus()))
                .forEach(invoice -> {
                    invoice.setInsuranceClaimId(claimId);
                    invoice.setInsuranceClaimNumber(claim.getClaimNumber());
                    invoice.setInsurancePolicyId(claim.getPolicyId());

                    BigDecimal covered = BigDecimal.valueOf(
                            approvedAmount != null ? approvedAmount : 0
                    );
                    invoice.setInsuranceCovered(covered);

                    BigDecimal total = invoice.getTotal() != null
                            ? invoice.getTotal()
                            : BigDecimal.ZERO;
                    invoice.setPatientResponsible(
                            total.subtract(covered).max(BigDecimal.ZERO)
                    );

                    invoiceRepository.save(invoice);
                    log.info("✅ [Billing] Linked claim {} to invoice {}",
                            claimId, invoice.getInvoiceNumber());
                });
    }

    // ============================================================
    // ✅ Deduct Inventory Stock (from Dev 09)
    // ============================================================
    public void deductInventoryStock(String medicineId, int quantity) {
        log.info("📦 [Billing] Deducting stock: {} x {}", medicineId, quantity);

        List<Inventory> batches = inventoryRepository.findAll().stream()
                .filter(inv -> medicineId.equals(inv.getMedicineId()))
                .filter(inv -> inv.getQuantityInStock() > 0)
                .toList();

        int remaining = quantity;

        for (Inventory batch : batches) {
            if (remaining <= 0) break;

            int deduct = Math.min(remaining, batch.getQuantityInStock());
            batch.setQuantityInStock(batch.getQuantityInStock() - deduct);

            if (batch.getQuantityInStock() <= 0) {
                batch.setStatus(InventoryStatus.OUT_OF_STOCK);
            } else if (batch.getQuantityInStock() <= batch.getReorderLevel()) {
                batch.setStatus(InventoryStatus.LOW_STOCK);
            } else {
                batch.setStatus(InventoryStatus.IN_STOCK);
            }

            inventoryRepository.save(batch);
            remaining -= deduct;
            log.info("✅ [Billing] Deducted {} from batch {}", deduct, batch.getId());
        }

        if (remaining > 0) {
            log.warn("⚠️ [Billing] Could not deduct all stock. Remaining: {}", remaining);
        }
    }
}