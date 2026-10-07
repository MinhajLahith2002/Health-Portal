package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.InventoryRequest;
import lk.gamage.backend.healthbridgebackend.dto.InventoryResponse;
import lk.gamage.backend.healthbridgebackend.model.Inventory;
import lk.gamage.backend.healthbridgebackend.enums.InventoryStatus;
import lk.gamage.backend.healthbridgebackend.repository.InventoryRepository;
import lk.gamage.backend.healthbridgebackend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public InventoryResponse addStock(InventoryRequest request) {
        Inventory inv = Inventory.builder()
                .pharmacyId(request.getPharmacyId())
                .medicineId(request.getMedicineId())
                .medicineCode(request.getItemCode())
                .medicineName(request.getItemName())
                .batchNumber(request.getBatchNumber())
                .supplierId(request.getSupplierId())
                .supplierName(request.getSupplier())
                .quantityInStock(request.getQuantity() != null ? request.getQuantity() : 0)
                .reorderLevel(request.getMinimumStock() != null ? request.getMinimumStock() : 0)
                .reorderQuantity(request.getReorderQuantity() != null ? request.getReorderQuantity() : 0)
                .costPrice(request.getUnitCost() != null ? request.getUnitCost() : 0)
                .sellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : 0)
                .manufactureDate(request.getManufactureDate())
                .expiryDate(request.getExpiryDate())
                .status(resolveStatus(request.getQuantity(), request.getMinimumStock()))
                .build();
        return toResponse(inventoryRepository.save(inv));
    }

    @Override
    public InventoryResponse updateStock(String id, InventoryRequest request) {
        Inventory inv = getEntity(id);
        inv.setQuantityInStock(request.getQuantity() != null ? request.getQuantity() : inv.getQuantityInStock());
        inv.setReorderLevel(request.getMinimumStock() != null ? request.getMinimumStock() : inv.getReorderLevel());
        inv.setSellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : inv.getSellingPrice());
        inv.setExpiryDate(request.getExpiryDate());
        inv.setStatus(resolveStatus(inv.getQuantityInStock(), inv.getReorderLevel()));
        return toResponse(inventoryRepository.save(inv));
    }

    @Override
    public InventoryResponse getById(String id) {
        return toResponse(getEntity(id));
    }

    @Override
    public List<InventoryResponse> getByPharmacy(String pharmacyId) {
        return inventoryRepository.findByPharmacyId(pharmacyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getLowStockAlerts(String pharmacyId) {
        return inventoryRepository.findLowStockByPharmacyId(pharmacyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        inventoryRepository.deleteById(id);
    }

    private Inventory getEntity(String id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory batch not found: " + id)); // ⚠️ balow note eka balanna
    }

    private InventoryStatus resolveStatus(Integer quantity, Integer reorderLevel) {
        int q = quantity != null ? quantity : 0;
        int r = reorderLevel != null ? reorderLevel : 0;
        if (q <= 0) return InventoryStatus.OUT_OF_STOCK;
        if (q <= r) return InventoryStatus.LOW_STOCK;
        return InventoryStatus.IN_STOCK;
    }

    private InventoryResponse toResponse(Inventory inv) {
        InventoryResponse r = new InventoryResponse();
        r.setId(inv.getId());
        r.setItemCode(inv.getMedicineCode());
        r.setItemName(inv.getMedicineName());
        r.setPharmacyId(inv.getPharmacyId());
        r.setMedicineId(inv.getMedicineId());
        r.setBatchNumber(inv.getBatchNumber());
        r.setSupplierName(inv.getSupplierName());
        r.setQuantity(inv.getQuantityInStock());
        r.setMinimumStock(inv.getReorderLevel());
        r.setUnitCost(inv.getCostPrice());
        r.setSellingPrice(inv.getSellingPrice());
        r.setExpiryDate(inv.getExpiryDate());
        r.setStatus(inv.getStatus() != null ? inv.getStatus().name() : null);
        return r;
    }
}