package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.dto.request.ClaimDecisionRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.InsuranceClaimRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.InsurancePolicyRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.InsuranceClaimResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.InsurancePolicyResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.InsuranceReportResponse;

import lk.gamage.backend.healthbridgebackend.enums.PolicyStatus;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface InsuranceService {
    InsurancePolicyResponse createPolicy(InsurancePolicyRequest request);
    InsurancePolicyResponse getPolicyById(String policyId);
    List<InsurancePolicyResponse> getAllPolicies();
    List<InsurancePolicyResponse> getPoliciesForPatient(String patientId);
    InsurancePolicyResponse verifyPolicy(String policyNumber);
    InsurancePolicyResponse updatePolicyStatus(String policyId, PolicyStatus status);
    List<InsuranceClaimResponse> getClaimsForPolicy(String policyId);

    InsuranceClaimResponse submitClaim(String patientId, InsuranceClaimRequest request, List<MultipartFile> documents);
    InsuranceClaimResponse getClaimById(String claimId, String requesterId, boolean isOfficer);
    List<InsuranceClaimResponse> getClaimsForPatient(String patientId);
    List<InsuranceClaimResponse> getAllClaims();
    InsuranceClaimResponse decideClaim(String claimId, String officerId, ClaimDecisionRequest decision);
    InsuranceClaimResponse startClaimReview(String claimId, String officerId);
    InsuranceReportResponse getInsuranceReportSummary(LocalDate startDate, LocalDate endDate);
}