package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.DeliveryDto;
import java.util.List;

public interface DeliveryService {
    DeliveryDto.Response create(DeliveryDto.Request request);
    DeliveryDto.Response updateStatus(String id, DeliveryDto.StatusUpdateRequest request);
    DeliveryDto.Response getById(String id);
    List<DeliveryDto.Response> getByPharmacy(String pharmacyId);
    List<DeliveryDto.Response> getByPatient(String patientId);
}