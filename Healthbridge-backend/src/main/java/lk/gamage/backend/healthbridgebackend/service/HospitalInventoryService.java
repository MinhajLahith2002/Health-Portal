package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.HospitalInventoryRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.HospitalInventoryResponse;

import java.util.List;

public interface HospitalInventoryService {

    HospitalInventoryResponse createInventory(
            HospitalInventoryRequest request
    );

    List<HospitalInventoryResponse> getAllInventory();

    HospitalInventoryResponse getInventory(String id);

    List<HospitalInventoryResponse> getHospitalInventory(
            String hospitalId
    );

    List<HospitalInventoryResponse> getLowStockItems();

    HospitalInventoryResponse updateInventory(
            String id,
            HospitalInventoryRequest request
    );

    void deleteInventory(String id);
}