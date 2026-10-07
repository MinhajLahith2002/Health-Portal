package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.HospitalInventoryRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.HospitalInventoryResponse;
import lk.gamage.backend.healthbridgebackend.model.HospitalInventory;
import lk.gamage.backend.healthbridgebackend.repository.HospitalInventoryRepository;
import lk.gamage.backend.healthbridgebackend.service.HospitalInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalInventoryServiceImpl
        implements HospitalInventoryService {

    private final HospitalInventoryRepository
            inventoryRepository;

    @Override
    public HospitalInventoryResponse createInventory(
            HospitalInventoryRequest request) {

        HospitalInventory inventory =
                new HospitalInventory();

        setValues(inventory, request);

        return mapToResponse(
                inventoryRepository.save(inventory)
        );
    }

    @Override
    public List<HospitalInventoryResponse> getAllInventory() {

        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public HospitalInventoryResponse getInventory(
            String id) {

        HospitalInventory inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory item not found: " + id
                                )
                        );

        return mapToResponse(inventory);
    }

    @Override
    public List<HospitalInventoryResponse>
    getHospitalInventory(String hospitalId) {

        return inventoryRepository
                .findByHospitalId(hospitalId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<HospitalInventoryResponse>
    getLowStockItems() {

        return inventoryRepository.findAll()
                .stream()
                .filter(item ->
                        item.getQuantity() != null &&
                                item.getReorderLevel() != null &&
                                item.getQuantity()
                                        <= item.getReorderLevel()
                )
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public HospitalInventoryResponse updateInventory(
            String id,
            HospitalInventoryRequest request) {

        HospitalInventory inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory item not found: " + id
                                )
                        );

        setValues(inventory, request);

        return mapToResponse(
                inventoryRepository.save(inventory)
        );
    }

    @Override
    public void deleteInventory(String id) {

        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException(
                    "Inventory item not found: " + id
            );
        }

        inventoryRepository.deleteById(id);
    }

    private void setValues(
            HospitalInventory inventory,
            HospitalInventoryRequest request) {

        inventory.setHospitalId(request.getHospitalId());
        inventory.setItemCode(request.getItemCode());
        inventory.setItemName(request.getItemName());
        inventory.setCategory(request.getCategory());
        inventory.setQuantity(request.getQuantity());
        inventory.setReorderLevel(request.getReorderLevel());
        inventory.setUnit(request.getUnit());
        inventory.setSupplier(request.getSupplier());
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setUnitCost(request.getUnitCost());
        inventory.setLocation(request.getLocation());
    }

    private HospitalInventoryResponse mapToResponse(
            HospitalInventory inventory) {

        boolean lowStock =
                inventory.getQuantity() != null &&
                        inventory.getReorderLevel() != null &&
                        inventory.getQuantity()
                                <= inventory.getReorderLevel();

        return HospitalInventoryResponse.builder()
                .id(inventory.getId())
                .hospitalId(inventory.getHospitalId())
                .itemCode(inventory.getItemCode())
                .itemName(inventory.getItemName())
                .category(inventory.getCategory())
                .quantity(inventory.getQuantity())
                .reorderLevel(inventory.getReorderLevel())
                .unit(inventory.getUnit())
                .supplier(inventory.getSupplier())
                .expiryDate(inventory.getExpiryDate())
                .unitCost(inventory.getUnitCost())
                .location(inventory.getLocation())
                .lowStock(lowStock)
                .build();
    }
}