package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.BillingItemRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.BillingItemResponse;
import lk.gamage.backend.healthbridgebackend.model.BillingItem;
import lk.gamage.backend.healthbridgebackend.repository.BillingItemRepository;
import lk.gamage.backend.healthbridgebackend.service.BillingItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingItemServiceImpl implements BillingItemService {

    private final BillingItemRepository billingItemRepository;

    @Override
    public BillingItemResponse createBillingItem(BillingItemRequest request) {
        log.info("📝 Creating billing item for invoice: {}", request.getInvoiceId());

        BillingItem item = BillingItem.builder()
                .invoiceId(request.getInvoiceId())
                .patientId(request.getPatientId())
                .category(request.getCategory())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .medicineId(request.getMedicineId())          // 🆕
                .medicineCode(request.getMedicineCode())      // 🆕
                .labTestId(request.getLabTestId())            // 🆕
                .inventoryId(request.getInventoryId())        // 🆕
                .prescriptionItemRef(request.getPrescriptionItemRef())  // 🆕
                .build();

        // Calculate amount
        if (request.getUnitPrice() != null && request.getQuantity() != null) {
            BigDecimal amount = request.getUnitPrice()
                    .multiply(BigDecimal.valueOf(request.getQuantity()));
            item.setAmount(amount);
        } else {
            item.setAmount(BigDecimal.ZERO);
        }

        BillingItem saved = billingItemRepository.save(item);
        log.info("✅ Billing item created: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    public List<BillingItemResponse> getAllBillingItems() {
        return billingItemRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BillingItemResponse getBillingItem(String id) {
        BillingItem item = billingItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing item not found: " + id));
        return mapToResponse(item);
    }

    @Override
    public List<BillingItemResponse> getInvoiceItems(String invoiceId) {
        return billingItemRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BillingItemResponse updateBillingItem(String id, BillingItemRequest request) {
        BillingItem item = billingItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing item not found: " + id));

        item.setInvoiceId(request.getInvoiceId());
        item.setPatientId(request.getPatientId());
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setQuantity(request.getQuantity());
        item.setUnitPrice(request.getUnitPrice());
        item.setMedicineId(request.getMedicineId());
        item.setMedicineCode(request.getMedicineCode());
        item.setLabTestId(request.getLabTestId());
        item.setInventoryId(request.getInventoryId());
        item.setPrescriptionItemRef(request.getPrescriptionItemRef());

        if (request.getUnitPrice() != null && request.getQuantity() != null) {
            BigDecimal amount = request.getUnitPrice()
                    .multiply(BigDecimal.valueOf(request.getQuantity()));
            item.setAmount(amount);
        }

        return mapToResponse(billingItemRepository.save(item));
    }

    @Override
    public void deleteBillingItem(String id) {
        if (!billingItemRepository.existsById(id)) {
            throw new RuntimeException("Billing item not found: " + id);
        }
        billingItemRepository.deleteById(id);
    }

    private BillingItemResponse mapToResponse(BillingItem item) {
        return BillingItemResponse.builder()
                .id(item.getId())
                .invoiceId(item.getInvoiceId())
                .patientId(item.getPatientId())
                .category(item.getCategory())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .amount(item.getAmount())
                .medicineId(item.getMedicineId())
                .medicineCode(item.getMedicineCode())
                .labTestId(item.getLabTestId())
                .inventoryId(item.getInventoryId())
                .prescriptionItemRef(item.getPrescriptionItemRef())
                .build();
    }
}