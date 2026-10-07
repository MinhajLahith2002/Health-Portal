package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.InventoryRequest;
import lk.gamage.backend.healthbridgebackend.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {

    InventoryResponse addStock(InventoryRequest request);

    InventoryResponse updateStock(String id, InventoryRequest request);

    InventoryResponse getById(String id);

    List<InventoryResponse> getByPharmacy(String pharmacyId);

    List<InventoryResponse> getLowStockAlerts(String pharmacyId);

    void delete(String id);
}