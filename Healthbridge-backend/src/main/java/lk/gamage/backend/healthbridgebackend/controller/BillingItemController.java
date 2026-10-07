package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.BillingItemRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.BillingItemResponse;
import lk.gamage.backend.healthbridgebackend.service.BillingItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital-billing/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BillingItemController {

    private final BillingItemService billingItemService;

    @PostMapping
    public ResponseEntity<BillingItemResponse> createBillingItem(
            @RequestBody BillingItemRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        billingItemService.createBillingItem(request)
                );
    }

    @GetMapping
    public ResponseEntity<List<BillingItemResponse>>
    getAllBillingItems() {

        return ResponseEntity.ok(
                billingItemService.getAllBillingItems()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingItemResponse>
    getBillingItem(@PathVariable String id) {

        return ResponseEntity.ok(
                billingItemService.getBillingItem(id)
        );
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<BillingItemResponse>>
    getInvoiceItems(@PathVariable String invoiceId) {

        return ResponseEntity.ok(
                billingItemService.getInvoiceItems(invoiceId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillingItemResponse>
    updateBillingItem(
            @PathVariable String id,
            @RequestBody BillingItemRequest request) {

        return ResponseEntity.ok(
                billingItemService.updateBillingItem(
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteBillingItem(@PathVariable String id) {

        billingItemService.deleteBillingItem(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}