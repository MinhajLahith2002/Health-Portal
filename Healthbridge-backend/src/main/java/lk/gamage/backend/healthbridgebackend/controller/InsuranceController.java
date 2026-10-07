package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.dto.request.ClaimDecisionRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.InsuranceClaimRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.InsurancePolicyRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.InsuranceClaimResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.InsurancePolicyResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.InsuranceReportResponse;
import lk.gamage.backend.healthbridgebackend.enums.PolicyStatus;
import lk.gamage.backend.healthbridgebackend.service.FileStorageService;
import lk.gamage.backend.healthbridgebackend.service.InsuranceService;
import lk.gamage.backend.healthbridgebackend.service.InsuranceMessageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance")
public class InsuranceController {

    private final InsuranceService insuranceService;
    private final FileStorageService fileStorageService;
    private final InsuranceMessageService insuranceMessageService;

    public InsuranceController(InsuranceService insuranceService, 
                               FileStorageService fileStorageService,
                               InsuranceMessageService insuranceMessageService) {
        this.insuranceService = insuranceService;
        this.fileStorageService = fileStorageService;
        this.insuranceMessageService = insuranceMessageService;
    }

    // ---- Policies ----

    @PostMapping("/policies")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InsurancePolicyResponse> createPolicy(@Valid @RequestBody InsurancePolicyRequest request) {
        return ResponseEntity.ok(insuranceService.createPolicy(request));
    }

    @GetMapping("/policies")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<InsurancePolicyResponse>> getAllPolicies() {
        return ResponseEntity.ok(insuranceService.getAllPolicies());
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<InsurancePolicyResponse> getPolicy(@PathVariable String id) {
        return ResponseEntity.ok(insuranceService.getPolicyById(id));
    }

    @GetMapping("/policies/my")
    public ResponseEntity<List<InsurancePolicyResponse>> getMyPolicies(Authentication auth) {
        return ResponseEntity.ok(insuranceService.getPoliciesForPatient(auth.getName()));
    }

    @GetMapping("/policies/verify/{policyNumber}")
    public ResponseEntity<InsurancePolicyResponse> verifyPolicy(@PathVariable String policyNumber) {
        return ResponseEntity.ok(insuranceService.verifyPolicy(policyNumber));
    }

    @PatchMapping("/policies/{id}/status")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InsurancePolicyResponse> updatePolicyStatus(
            @PathVariable String id, @RequestParam PolicyStatus status) {
        return ResponseEntity.ok(insuranceService.updatePolicyStatus(id, status));
    }

    @GetMapping("/policies/{id}/claims")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<InsuranceClaimResponse>> getClaimsForPolicy(@PathVariable String id) {
        return ResponseEntity.ok(insuranceService.getClaimsForPolicy(id));
    }

    // ---- Claims ----

    @PostMapping(value = "/claims", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<InsuranceClaimResponse> submitClaim(
            @RequestPart("claim") @Valid InsuranceClaimRequest request,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents,
            Authentication auth) {
        return ResponseEntity.ok(insuranceService.submitClaim(auth.getName(), request, documents));
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<InsuranceClaimResponse> getClaim(@PathVariable String id, Authentication auth) {
        boolean isOfficer = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_INSURANCE_OFFICER") || a.equals("ROLE_ADMIN") || a.equals("ROLE_SUPER_ADMIN"));
        return ResponseEntity.ok(insuranceService.getClaimById(id, auth.getName(), isOfficer));
    }

    @GetMapping("/claims/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<InsuranceClaimResponse>> getMyClaims(Authentication auth) {
        return ResponseEntity.ok(insuranceService.getClaimsForPatient(auth.getName()));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<InsuranceClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(insuranceService.getAllClaims());
    }

    @PatchMapping("/claims/{id}/decision")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN')")
    public ResponseEntity<InsuranceClaimResponse> decideClaim(
            @PathVariable String id, @Valid @RequestBody ClaimDecisionRequest decision, Authentication auth) {
        return ResponseEntity.ok(insuranceService.decideClaim(id, auth.getName(), decision));
    }

    @PatchMapping("/claims/{id}/review")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InsuranceClaimResponse> startClaimReview(
            @PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(insuranceService.startClaimReview(id, auth.getName()));
    }

    // ---- Reports ----

    @GetMapping("/reports/summary")
    @PreAuthorize("hasAnyRole('INSURANCE_OFFICER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InsuranceReportResponse> getReportSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(insuranceService.getInsuranceReportSummary(startDate, endDate));
    }

    // ---- Document download ----

    @GetMapping("/documents/{fileId}")
    public ResponseEntity<InputStreamResource> downloadDocument(@PathVariable String fileId) {
        InputStreamResource resource = new InputStreamResource(fileStorageService.retrieve(fileId));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileStorageService.getContentType(fileId)))
                .body(resource);
    }

    @GetMapping("/messages/unread-count")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Long>> getUnreadMessagesCount(@org.springframework.security.core.annotation.AuthenticationPrincipal lk.gamage.backend.healthbridgebackend.security.CustomUserDetails user) {
        long count = insuranceMessageService.getUnreadMessageCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }
}