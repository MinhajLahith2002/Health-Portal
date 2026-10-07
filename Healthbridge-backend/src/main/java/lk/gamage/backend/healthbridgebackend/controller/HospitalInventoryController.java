package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.HospitalInventoryRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.HospitalInventoryResponse;
import lk.gamage.backend.healthbridgebackend.service.HospitalInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital-billing/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HospitalInventoryController {

    private final HospitalInventoryService inventoryService;

    @PostMapping
    public ResponseEntity<HospitalInventoryResponse>
    createInventory(
            @RequestBody HospitalInventoryRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        inventoryService.createInventory(request)
                );
    }

    @GetMapping
    public ResponseEntity<List<HospitalInventoryResponse>>
    getAllInventory() {

        return ResponseEntity.ok(
                inventoryService.getAllInventory()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalInventoryResponse>
    getInventory(@PathVariable String id) {

        return ResponseEntity.ok(
                inventoryService.getInventory(id)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<HospitalInventoryResponse>>
    getHospitalInventory(
            @PathVariable String hospitalId) {

        return ResponseEntity.ok(
                inventoryService.getHospitalInventory(
                        hospitalId
                )
        );
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<HospitalInventoryResponse>>
    getLowStockItems() {

        return ResponseEntity.ok(
                inventoryService.getLowStockItems()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<HospitalInventoryResponse>
    updateInventory(
            @PathVariable String id,
            @RequestBody HospitalInventoryRequest request) {

        return ResponseEntity.ok(
                inventoryService.updateInventory(
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteInventory(@PathVariable String id) {

        inventoryService.deleteInventory(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}