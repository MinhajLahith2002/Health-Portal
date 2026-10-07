package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.BillingItemRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.BillingItemResponse;

import java.util.List;

public interface BillingItemService {

    BillingItemResponse createBillingItem(
            BillingItemRequest request
    );

    List<BillingItemResponse> getAllBillingItems();

    BillingItemResponse getBillingItem(String id);

    List<BillingItemResponse> getInvoiceItems(
            String invoiceId
    );

    BillingItemResponse updateBillingItem(
            String id,
            BillingItemRequest request
    );

    void deleteBillingItem(String id);
}