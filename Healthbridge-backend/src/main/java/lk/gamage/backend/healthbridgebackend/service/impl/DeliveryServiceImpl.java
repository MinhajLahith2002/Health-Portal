package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.DeliveryDto;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Delivery;
import lk.gamage.backend.healthbridgebackend.enums.DeliveryStatus;
import lk.gamage.backend.healthbridgebackend.repository.DeliveryRepository;
import lk.gamage.backend.healthbridgebackend.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;

    @Override
    public DeliveryDto.Response create(DeliveryDto.Request request) {
        Delivery delivery = Delivery.builder()
                .deliveryCode("DLV-" + LocalDate.now().toString().replace("-", "")
                        + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .pharmacyId(request.getPharmacyId())
                .patientId(request.getPatientId())
                .prescriptionId(request.getPrescriptionId())
                .items(request.getItems().stream()
                        .map(i -> Delivery.DeliveryItem.builder()
                                .medicineId(i.getMedicineId())
                                .medicineName(i.getMedicineName())
                                .quantity(i.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .deliveryAddress(request.getDeliveryAddress())
                .contactPhone(request.getContactPhone())
                .status(DeliveryStatus.PENDING)
                .scheduledAt(LocalDateTime.now())
                .build();
        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    public DeliveryDto.Response updateStatus(String id, DeliveryDto.StatusUpdateRequest request) {
        Delivery delivery = getEntity(id);
        DeliveryStatus status = DeliveryStatus.valueOf(request.getStatus().toUpperCase());
        delivery.setStatus(status);
        if (request.getAssignedRiderId() != null) {
            delivery.setAssignedRiderId(request.getAssignedRiderId());
            delivery.setAssignedRiderName(request.getAssignedRiderName());
        }
        if (status == DeliveryStatus.DISPATCHED) delivery.setDispatchedAt(LocalDateTime.now());
        if (status == DeliveryStatus.DELIVERED) delivery.setDeliveredAt(LocalDateTime.now());
        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    public DeliveryDto.Response getById(String id) {
        return toResponse(getEntity(id));
    }

    @Override
    public List<DeliveryDto.Response> getByPharmacy(String pharmacyId) {
        return deliveryRepository.findByPharmacyId(pharmacyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<DeliveryDto.Response> getByPatient(String patientId) {
        return deliveryRepository.findByPatientId(patientId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private Delivery getEntity(String id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));
    }

    private DeliveryDto.Response toResponse(Delivery d) {
        DeliveryDto.Response r = new DeliveryDto.Response();
        r.setId(d.getId());
        r.setDeliveryCode(d.getDeliveryCode());
        r.setPharmacyId(d.getPharmacyId());
        r.setPatientId(d.getPatientId());
        r.setDeliveryAddress(d.getDeliveryAddress());
        r.setStatus(d.getStatus().name());
        r.setAssignedRiderName(d.getAssignedRiderName());
        return r;
    }
}