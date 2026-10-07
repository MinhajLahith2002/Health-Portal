package lk.gamage.backend.healthbridgebackend.mapper;

import lk.gamage.backend.healthbridgebackend.dto.DeliveryDto;
import lk.gamage.backend.healthbridgebackend.model.Delivery;
import lk.gamage.backend.healthbridgebackend.enums.DeliveryStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

public class DeliveryMapper {

    public static Delivery toEntity(DeliveryDto.Request request) {
        return Delivery.builder()
                .deliveryCode("DLV-" + LocalDate.now().toString().replace("-", "")
                        + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .orderCode("ORD-" + (1000 + (int) (Math.random() * 9000)))
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
                .fulfillmentType(request.getFulfillmentType() != null ? request.getFulfillmentType() : "DELIVERY")
                .courierService(request.getCourierService())
                .actionRequired(true)
                .status(DeliveryStatus.PENDING)
                .scheduledAt(LocalDateTime.now())
                .build();
    }

    public static DeliveryDto.Response toResponse(Delivery d) {
        DeliveryDto.Response r = new DeliveryDto.Response();
        r.setId(d.getId());
        r.setDeliveryCode(d.getDeliveryCode());
        r.setOrderCode(d.getOrderCode());
        r.setPharmacyId(d.getPharmacyId());
        r.setPatientId(d.getPatientId());
        r.setItems(d.getItems().stream()
                .map(i -> {
                    DeliveryDto.ItemDTO dto = new DeliveryDto.ItemDTO();
                    dto.setMedicineId(i.getMedicineId());
                    dto.setMedicineName(i.getMedicineName());
                    dto.setQuantity(i.getQuantity());
                    return dto;
                })
                .collect(Collectors.toList()));
        r.setDeliveryAddress(d.getDeliveryAddress());
        r.setStatus(d.getStatus().name());
        r.setAssignedRiderName(d.getAssignedRiderName());
        r.setFulfillmentType(d.getFulfillmentType());
        r.setActionRequired(d.isActionRequired());
        r.setCourierService(d.getCourierService());
        return r;
    }
}