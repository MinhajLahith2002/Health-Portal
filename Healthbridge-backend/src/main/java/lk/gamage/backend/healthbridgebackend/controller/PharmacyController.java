package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.PharmacyDTOs;
import lk.gamage.backend.healthbridgebackend.dto.MedicineDto;
import lk.gamage.backend.healthbridgebackend.dto.DeliveryDto;
import lk.gamage.backend.healthbridgebackend.dto.InventoryRequest;
import lk.gamage.backend.healthbridgebackend.dto.InventoryResponse;
import lk.gamage.backend.healthbridgebackend.service.PharmacyService;
import lk.gamage.backend.healthbridgebackend.service.MedicineService;
import lk.gamage.backend.healthbridgebackend.service.InventoryService;
import lk.gamage.backend.healthbridgebackend.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;
    private final MedicineService medicineService;
    private final InventoryService inventoryService;
    private final DeliveryService deliveryService;

    // ================= Pharmacy branch =================

    @PostMapping("/pharmacies")
    public ResponseEntity<PharmacyDTOs.Response> registerPharmacy(@Valid @RequestBody PharmacyDTOs.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.register(request));
    }

    @PutMapping("/pharmacies/{id}")
    public ResponseEntity<PharmacyDTOs.Response> updatePharmacyProfile(
            @PathVariable String id, @Valid @RequestBody PharmacyDTOs.Request request) {
        return ResponseEntity.ok(pharmacyService.updateProfile(id, request));
    }

    @PatchMapping("/pharmacies/{id}/approve")
    public ResponseEntity<PharmacyDTOs.Response> approvePharmacy(@PathVariable String id) {
        return ResponseEntity.ok(pharmacyService.approve(id));
    }

    @PatchMapping("/pharmacies/{id}/active")
    public ResponseEntity<PharmacyDTOs.Response> setPharmacyActive(
            @PathVariable String id, @RequestParam boolean active) {
        return ResponseEntity.ok(pharmacyService.setActive(id, active));
    }

    @GetMapping("/pharmacies/{id}")
    public ResponseEntity<PharmacyDTOs.Response> getPharmacyById(@PathVariable String id) {
        return ResponseEntity.ok(pharmacyService.getById(id));
    }

    @GetMapping("/pharmacies")
    public ResponseEntity<List<PharmacyDTOs.Response>> getAllActivePharmacies() {
        return ResponseEntity.ok(pharmacyService.getAllActive());
    }

    // ================= Medicine catalog =================

    @PostMapping("/medicines")
    public ResponseEntity<MedicineDto.Response> createMedicine(@Valid @RequestBody MedicineDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.create(request));
    }

    @PutMapping("/medicines/{id}")
    public ResponseEntity<MedicineDto.Response> updateMedicine(
            @PathVariable String id, @Valid @RequestBody MedicineDto.Request request) {
        return ResponseEntity.ok(medicineService.update(id, request));
    }

    @GetMapping("/medicines/{id}")
    public ResponseEntity<MedicineDto.Response> getMedicineById(@PathVariable String id) {
        return ResponseEntity.ok(medicineService.getById(id));
    }

    @GetMapping("/medicines")
    public ResponseEntity<List<MedicineDto.Response>> getMedicines(
            @RequestParam(required = false) String name) {
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(medicineService.searchByName(name));
        }
        return ResponseEntity.ok(medicineService.getAll());
    }

    @DeleteMapping("/medicines/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable String id) {
        medicineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ================= Inventory =================

    @PostMapping("/inventory")
    public ResponseEntity<InventoryResponse> addStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.addStock(request));
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<InventoryResponse> updateStock(
            @PathVariable String id, @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(id, request));
    }

    @GetMapping("/inventory/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable String id) {
        return ResponseEntity.ok(inventoryService.getById(id));
    }

    @GetMapping("/inventory/pharmacy/{pharmacyId}")
    public ResponseEntity<List<InventoryResponse>> getInventoryByPharmacy(@PathVariable String pharmacyId) {
        return ResponseEntity.ok(inventoryService.getByPharmacy(pharmacyId));
    }

    @GetMapping("/inventory/alerts/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockAlerts(@RequestParam String pharmacyId) {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts(pharmacyId));
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable String id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ================= Delivery tracking =================

    @PostMapping("/deliveries")
    public ResponseEntity<DeliveryDto.Response> createDelivery(@Valid @RequestBody DeliveryDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.create(request));
    }

    @PatchMapping("/deliveries/{id}/status")
    public ResponseEntity<DeliveryDto.Response> updateDeliveryStatus(
            @PathVariable String id, @Valid @RequestBody DeliveryDto.StatusUpdateRequest request) {
        return ResponseEntity.ok(deliveryService.updateStatus(id, request));
    }

    @GetMapping("/deliveries/{id}")
    public ResponseEntity<DeliveryDto.Response> getDeliveryById(@PathVariable String id) {
        return ResponseEntity.ok(deliveryService.getById(id));
    }

    @GetMapping("/deliveries/pharmacy/{pharmacyId}")
    public ResponseEntity<List<DeliveryDto.Response>> getDeliveriesByPharmacy(@PathVariable String pharmacyId) {
        return ResponseEntity.ok(deliveryService.getByPharmacy(pharmacyId));
    }

    @GetMapping("/deliveries/patient/{patientId}")
    public ResponseEntity<List<DeliveryDto.Response>> getDeliveriesByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(deliveryService.getByPatient(patientId));
    }
}