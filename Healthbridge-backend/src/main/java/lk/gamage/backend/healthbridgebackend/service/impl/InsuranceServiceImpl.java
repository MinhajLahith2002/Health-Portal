package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.dto.request.ClaimDecisionRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.InsuranceClaimRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.InsurancePolicyRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.InsuranceClaimResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.InsurancePolicyResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.InsuranceReportResponse;
import lk.gamage.backend.healthbridgebackend.enums.ClaimStatus;
import lk.gamage.backend.healthbridgebackend.enums.PolicyStatus;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.exception.UnauthorizedException;
import lk.gamage.backend.healthbridgebackend.model.InsuranceClaim;
import lk.gamage.backend.healthbridgebackend.model.InsurancePolicy;
import lk.gamage.backend.healthbridgebackend.repository.InsuranceClaimRepository;
import lk.gamage.backend.healthbridgebackend.repository.InsurancePolicyRepository;
import lk.gamage.backend.healthbridgebackend.service.CloudinaryService;
import lk.gamage.backend.healthbridgebackend.service.FileStorageService;
import lk.gamage.backend.healthbridgebackend.service.FraudDetectionService;
import lk.gamage.backend.healthbridgebackend.service.InsuranceService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InsuranceServiceImpl implements InsuranceService {

    private static final Logger log = LoggerFactory.getLogger(InsuranceServiceImpl.class);

    private final InsurancePolicyRepository policyRepo;
    private final InsuranceClaimRepository claimRepo;
    private final FileStorageService fileStorageService;
    private final CloudinaryService cloudinaryService;
    private final FraudDetectionService fraudDetectionService;

    public InsuranceServiceImpl(InsurancePolicyRepository policyRepo,
                                 InsuranceClaimRepository claimRepo,
                                 FileStorageService fileStorageService,
                                 CloudinaryService cloudinaryService,
                                 FraudDetectionService fraudDetectionService) {
        this.policyRepo = policyRepo;
        this.claimRepo = claimRepo;
        this.fileStorageService = fileStorageService;
        this.cloudinaryService = cloudinaryService;
        this.fraudDetectionService = fraudDetectionService;
    }

    @Override
    public InsurancePolicyResponse createPolicy(InsurancePolicyRequest req) {
        if (policyRepo.existsByPolicyNumber(req.getPolicyNumber())) {
            throw new BadRequestException("Policy number already exists");
        }
        if (!req.getEndDate().isAfter(req.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }
        InsurancePolicy policy = InsurancePolicy.builder()
                .policyNumber(req.getPolicyNumber())
                .patientId(req.getPatientId())
                .providerName(req.getProviderName())
                .policyType(req.getPolicyType())
                .coverageAmount(req.getCoverageAmount())
                .coverageUsed(0.0)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .status(PolicyStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return toInsurancePolicyResponse(policyRepo.save(policy));
    }

    @Override
    public InsurancePolicyResponse getPolicyById(String policyId) {
        return toInsurancePolicyResponse(findPolicyOrThrow(policyId));
    }

    @Override
    public List<InsurancePolicyResponse> getAllPolicies() {
        return policyRepo.findAll().stream()
                .map(this::toInsurancePolicyResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InsurancePolicyResponse> getPoliciesForPatient(String patientId) {
        return policyRepo.findByPatientId(patientId).stream()
                .map(this::toInsurancePolicyResponse).collect(Collectors.toList());
    }

    @Override
    public InsurancePolicyResponse verifyPolicy(String policyNumber) {
        InsurancePolicy policy = policyRepo.findByPolicyNumber(policyNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + policyNumber));
        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new BadRequestException("Policy is not active: " + policy.getStatus());
        }
        if (policy.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Policy has expired");
        }
        return toInsurancePolicyResponse(policy);
    }

    @Override
    public InsurancePolicyResponse updatePolicyStatus(String policyId, PolicyStatus status) {
        InsurancePolicy policy = findPolicyOrThrow(policyId);
        policy.setStatus(status);
        policy.setUpdatedAt(LocalDateTime.now());
        return toInsurancePolicyResponse(policyRepo.save(policy));
    }

    @Override
    public List<InsuranceClaimResponse> getClaimsForPolicy(String policyId) {
        findPolicyOrThrow(policyId);
        return claimRepo.findByPolicyId(policyId).stream()
                .map(this::toInsuranceClaimResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InsuranceClaimResponse submitClaim(String patientId, InsuranceClaimRequest req, List<MultipartFile> documents) {
        InsurancePolicy policy = findPolicyOrThrow(req.getPolicyId());

        if (!policy.getPatientId().equals(patientId)) {
            throw new UnauthorizedException("This policy does not belong to you");
        }
        if (policy.getStatus() != PolicyStatus.ACTIVE || policy.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Policy is not active or has expired");
        }
        // SRS 8.2.5: claim amount cannot exceed policy limits
        double remaining = policy.getCoverageAmount() - policy.getCoverageUsed();
        if (req.getClaimAmount() > remaining) {
            throw new BadRequestException(
                    "Claim amount exceeds remaining policy coverage (remaining: " + remaining + ")");
        }
        // SRS 8.2.5: supporting documents must be attached
        if (documents == null || documents.isEmpty()) {
            throw new BadRequestException("At least one supporting document is required");
        }

        List<String> documentUrls = new ArrayList<>();
        List<String> documentPublicIds = new ArrayList<>();
        List<String> fileIds = new ArrayList<>();

        for (MultipartFile doc : documents) {
            if (doc != null && !doc.isEmpty()) {
                boolean uploadedToCloudinary = false;
                try {
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(doc, "insurance/claims");
                    if (uploadResult != null && uploadResult.get("url") != null) {
                        documentUrls.add(uploadResult.get("url"));
                        if (uploadResult.get("publicId") != null) {
                            documentPublicIds.add(uploadResult.get("publicId"));
                        }
                        uploadedToCloudinary = true;
                    }
                } catch (Exception e) {
                    // Fallback to GridFS file storage if Cloudinary upload encounters an issue
                }

                if (!uploadedToCloudinary) {
                    try {
                        String storedFileId = fileStorageService.store(doc);
                        fileIds.add(storedFileId);
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        String hospital = (req.getHospitalName() != null && !req.getHospitalName().isBlank())
                ? req.getHospitalName() : "HealthBridge Hospital";
        String branch = (req.getBranch() != null && !req.getBranch().isBlank())
                ? req.getBranch() : "Colombo";

        InsuranceClaim claim = InsuranceClaim.builder()
                .claimNumber("CLM-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .policyId(policy.getId())
                .patientId(patientId)
                .treatmentDescription(req.getTreatmentDescription())
                .hospitalName(hospital)
                .branch(branch)
                .claimAmount(req.getClaimAmount())
                .documentUrls(documentUrls)
                .documentPublicIds(documentPublicIds)
                .documentFileIds(fileIds)
                .status(ClaimStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        InsuranceClaim savedClaim = claimRepo.save(claim);
        try {
            fraudDetectionService.analyzeClaimForFraud(savedClaim.getId());
        } catch (RuntimeException exception) {
            // Claim submission must remain available if fraud analysis is temporarily unavailable.
            log.error("Fraud analysis failed claimId={}", savedClaim.getId(), exception);
        }

        return toInsuranceClaimResponse(savedClaim);
    }

    @Override
    public InsuranceClaimResponse getClaimById(String claimId, String requesterId, boolean isOfficer) {
        InsuranceClaim claim = findClaimOrThrow(claimId);
        if (!isOfficer && !claim.getPatientId().equals(requesterId)) {
            throw new UnauthorizedException("You do not have access to this claim");
        }
        return toInsuranceClaimResponse(claim);
    }

    @Override
    public List<InsuranceClaimResponse> getClaimsForPatient(String patientId) {
        return claimRepo.findByPatientId(patientId).stream()
                .map(this::toInsuranceClaimResponse).collect(Collectors.toList());
    }

    @Override
    public List<InsuranceClaimResponse> getAllClaims() {
        return claimRepo.findAll().stream()
                .map(this::toInsuranceClaimResponse).collect(Collectors.toList());
    }

    @Override
    public InsuranceClaimResponse decideClaim(String claimId, String officerId, ClaimDecisionRequest decision) {
        InsuranceClaim claim = findClaimOrThrow(claimId);
        if (claim.getStatus() != ClaimStatus.SUBMITTED && claim.getStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new BadRequestException("Claim has already been decided");
        }

        if (Boolean.TRUE.equals(decision.getApprove())) {
            if (decision.getApprovedAmount() == null || decision.getApprovedAmount() <= 0) {
                throw new BadRequestException("Approved amount is required for approval");
            }
            InsurancePolicy policy = findPolicyOrThrow(claim.getPolicyId());
            double remaining = policy.getCoverageAmount() - policy.getCoverageUsed();
            if (decision.getApprovedAmount() > remaining) {
                throw new BadRequestException("Approved amount exceeds remaining policy coverage");
            }
            policy.setCoverageUsed(policy.getCoverageUsed() + decision.getApprovedAmount());
            policy.setUpdatedAt(LocalDateTime.now());
            policyRepo.save(policy);

            claim.setStatus(ClaimStatus.APPROVED);
            claim.setApprovedAmount(decision.getApprovedAmount());
        } else {
            if (decision.getRejectionReason() == null || decision.getRejectionReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required");
            }
            claim.setStatus(ClaimStatus.REJECTED);
            claim.setRejectionReason(decision.getRejectionReason());
        }

        claim.setReviewedByOfficerId(officerId);
        claim.setReviewedAt(LocalDateTime.now());
        claim.setUpdatedAt(LocalDateTime.now());

        return toInsuranceClaimResponse(claimRepo.save(claim));
    }

    @Override
    public InsuranceClaimResponse startClaimReview(String claimId, String officerId) {
        InsuranceClaim claim = findClaimOrThrow(claimId);
        if (claim.getStatus() == ClaimStatus.SUBMITTED) {
            claim.setStatus(ClaimStatus.UNDER_REVIEW);
            claim.setReviewedByOfficerId(officerId);
            claim.setUpdatedAt(LocalDateTime.now());
            claim = claimRepo.save(claim);
        }
        return toInsuranceClaimResponse(claim);
    }

    @Override
    public InsuranceReportResponse getInsuranceReportSummary(LocalDate startDate, LocalDate endDate) {
        List<InsuranceClaim> allClaims = claimRepo.findAll();
        List<InsurancePolicy> allPolicies = policyRepo.findAll();

        // Filter claims by date range if provided
        List<InsuranceClaim> filteredClaims = allClaims.stream()
                .filter(c -> {
                    if (c.getSubmittedAt() == null) return false;
                    LocalDate submittedDate = c.getSubmittedAt().toLocalDate();
                    if (startDate != null && submittedDate.isBefore(startDate)) return false;
                    if (endDate != null && submittedDate.isAfter(endDate)) return false;
                    return true;
                })
                .collect(Collectors.toList());

        long totalClaims = filteredClaims.size();
        long approvedClaims = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.APPROVED || c.getStatus() == ClaimStatus.PAID).count();
        long pendingClaims = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.SUBMITTED || c.getStatus() == ClaimStatus.UNDER_REVIEW).count();
        long rejectedClaims = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.REJECTED).count();
        long paidClaims = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.PAID).count();

        double totalClaimAmount = filteredClaims.stream()
                .mapToDouble(c -> c.getClaimAmount() != null ? c.getClaimAmount() : 0.0).sum();
        double totalApprovedAmount = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.APPROVED || c.getStatus() == ClaimStatus.PAID)
                .mapToDouble(c -> c.getApprovedAmount() != null ? c.getApprovedAmount() : (c.getClaimAmount() != null ? c.getClaimAmount() : 0.0)).sum();
        double totalRejectedAmount = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.REJECTED)
                .mapToDouble(c -> c.getClaimAmount() != null ? c.getClaimAmount() : 0.0).sum();
        double totalPendingAmount = filteredClaims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.SUBMITTED || c.getStatus() == ClaimStatus.UNDER_REVIEW)
                .mapToDouble(c -> c.getClaimAmount() != null ? c.getClaimAmount() : 0.0).sum();

        double approvalRate = totalClaims > 0 ? (approvedClaims * 100.0 / totalClaims) : 0.0;
        double rejectionRate = totalClaims > 0 ? (rejectedClaims * 100.0 / totalClaims) : 0.0;

        // Average processing time in hours
        double avgProcessingTimeHours = filteredClaims.stream()
                .filter(c -> c.getSubmittedAt() != null && c.getReviewedAt() != null)
                .mapToLong(c -> Duration.between(c.getSubmittedAt(), c.getReviewedAt()).toMinutes())
                .average()
                .orElse(0.0) / 60.0;

        // Status counts and amounts maps
        Map<String, Long> statusCounts = new HashMap<>();
        Map<String, Double> statusAmounts = new HashMap<>();
        for (ClaimStatus status : ClaimStatus.values()) {
            statusCounts.put(status.name(), 0L);
            statusAmounts.put(status.name(), 0.0);
        }
        for (InsuranceClaim c : filteredClaims) {
            if (c.getStatus() != null) {
                String sName = c.getStatus().name();
                statusCounts.put(sName, statusCounts.getOrDefault(sName, 0L) + 1L);
                statusAmounts.put(sName, statusAmounts.getOrDefault(sName, 0.0) + (c.getClaimAmount() != null ? c.getClaimAmount() : 0.0));
            }
        }

        // Policy Metrics
        long totalPolicies = allPolicies.size();
        long activePolicies = allPolicies.stream().filter(p -> p.getStatus() == PolicyStatus.ACTIVE).count();
        double totalCoverageIssued = allPolicies.stream()
                .mapToDouble(p -> p.getCoverageAmount() != null ? p.getCoverageAmount() : 0.0).sum();
        double totalCoverageUsed = allPolicies.stream()
                .mapToDouble(p -> p.getCoverageUsed() != null ? p.getCoverageUsed() : 0.0).sum();
        double totalCoverageRemaining = Math.max(0.0, totalCoverageIssued - totalCoverageUsed);
        double policyUtilizationRate = totalCoverageIssued > 0 ? (totalCoverageUsed * 100.0 / totalCoverageIssued) : 0.0;

        // Monthly trends (Last 6 months)
        Map<String, InsuranceReportResponse.MonthlyTrendItem> trendsMap = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDate mDate = now.minusMonths(i);
            String mKey = mDate.format(monthFormatter);
            trendsMap.put(mKey, InsuranceReportResponse.MonthlyTrendItem.builder()
                    .month(mKey)
                    .year(mDate.getYear())
                    .claimCount(0L)
                    .approvedCount(0L)
                    .totalRequested(0.0)
                    .totalApproved(0.0)
                    .build());
        }

        for (InsuranceClaim c : filteredClaims) {
            if (c.getSubmittedAt() != null) {
                String mKey = c.getSubmittedAt().format(monthFormatter);
                InsuranceReportResponse.MonthlyTrendItem item = trendsMap.get(mKey);
                if (item != null) {
                    item.setClaimCount(item.getClaimCount() + 1);
                    item.setTotalRequested(item.getTotalRequested() + (c.getClaimAmount() != null ? c.getClaimAmount() : 0.0));
                    if (c.getStatus() == ClaimStatus.APPROVED || c.getStatus() == ClaimStatus.PAID) {
                        item.setApprovedCount(item.getApprovedCount() + 1);
                        item.setTotalApproved(item.getTotalApproved() + (c.getApprovedAmount() != null ? c.getApprovedAmount() : (c.getClaimAmount() != null ? c.getClaimAmount() : 0.0)));
                    }
                }
            }
        }

        // Provider summaries
        Map<String, InsuranceReportResponse.ProviderSummaryItem> providerMap = new HashMap<>();
        Map<String, String> policyToProvider = new HashMap<>();
        for (InsurancePolicy p : allPolicies) {
            String prov = p.getProviderName() != null ? p.getProviderName() : "General";
            policyToProvider.put(p.getId(), prov);
            InsuranceReportResponse.ProviderSummaryItem pItem = providerMap.computeIfAbsent(prov, k ->
                    InsuranceReportResponse.ProviderSummaryItem.builder()
                            .providerName(prov)
                            .policyCount(0L)
                            .claimCount(0L)
                            .totalCoverage(0.0)
                            .totalClaimed(0.0)
                            .totalApproved(0.0)
                            .build());
            pItem.setPolicyCount(pItem.getPolicyCount() + 1);
            pItem.setTotalCoverage(pItem.getTotalCoverage() + (p.getCoverageAmount() != null ? p.getCoverageAmount() : 0.0));
        }

        for (InsuranceClaim c : filteredClaims) {
            String prov = policyToProvider.getOrDefault(c.getPolicyId(), "General");
            InsuranceReportResponse.ProviderSummaryItem pItem = providerMap.computeIfAbsent(prov, k ->
                    InsuranceReportResponse.ProviderSummaryItem.builder()
                            .providerName(prov)
                            .policyCount(0L)
                            .claimCount(0L)
                            .totalCoverage(0.0)
                            .totalClaimed(0.0)
                            .totalApproved(0.0)
                            .build());
            pItem.setClaimCount(pItem.getClaimCount() + 1);
            pItem.setTotalClaimed(pItem.getTotalClaimed() + (c.getClaimAmount() != null ? c.getClaimAmount() : 0.0));
            if (c.getStatus() == ClaimStatus.APPROVED || c.getStatus() == ClaimStatus.PAID) {
                pItem.setTotalApproved(pItem.getTotalApproved() + (c.getApprovedAmount() != null ? c.getApprovedAmount() : (c.getClaimAmount() != null ? c.getClaimAmount() : 0.0)));
            }
        }

        List<InsuranceClaimResponse> mappedClaims = filteredClaims.stream()
                .map(this::toInsuranceClaimResponse)
                .collect(Collectors.toList());

        return InsuranceReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalClaims(totalClaims)
                .approvedClaims(approvedClaims)
                .pendingClaims(pendingClaims)
                .rejectedClaims(rejectedClaims)
                .paidClaims(paidClaims)
                .totalClaimAmount(totalClaimAmount)
                .totalApprovedAmount(totalApprovedAmount)
                .totalRejectedAmount(totalRejectedAmount)
                .totalPendingAmount(totalPendingAmount)
                .approvalRate(approvalRate)
                .rejectionRate(rejectionRate)
                .averageProcessingTimeHours(avgProcessingTimeHours)
                .totalPolicies(totalPolicies)
                .activePolicies(activePolicies)
                .totalCoverageIssued(totalCoverageIssued)
                .totalCoverageUsed(totalCoverageUsed)
                .totalCoverageRemaining(totalCoverageRemaining)
                .policyUtilizationRate(policyUtilizationRate)
                .statusCounts(statusCounts)
                .statusAmounts(statusAmounts)
                .monthlyTrends(new ArrayList<>(trendsMap.values()))
                .providerSummaries(new ArrayList<>(providerMap.values()))
                .claims(mappedClaims)
                .build();
    }

    // --- helpers ---

    private InsurancePolicy findPolicyOrThrow(String id) {
        return policyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + id));
    }

    private InsuranceClaim findClaimOrThrow(String id) {
        return claimRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));
    }

    private InsurancePolicyResponse toInsurancePolicyResponse(InsurancePolicy p) {
        return InsurancePolicyResponse.builder()
                .id(p.getId())
                .policyNumber(p.getPolicyNumber())
                .patientId(p.getPatientId())
                .providerName(p.getProviderName())
                .policyType(p.getPolicyType())
                .coverageAmount(p.getCoverageAmount())
                .coverageUsed(p.getCoverageUsed())
                .coverageRemaining(p.getCoverageAmount() - p.getCoverageUsed())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .status(p.getStatus())
                .build();
    }

    private InsuranceClaimResponse toInsuranceClaimResponse(InsuranceClaim c) {
        String policyNumber = null;
        String providerName = null;
        if (c.getPolicyId() != null) {
            Optional<InsurancePolicy> policyOpt = policyRepo.findById(c.getPolicyId());
            if (policyOpt.isPresent()) {
                policyNumber = policyOpt.get().getPolicyNumber();
                providerName = policyOpt.get().getProviderName();
            }
        }

        return InsuranceClaimResponse.builder()
                .id(c.getId())
                .claimNumber(c.getClaimNumber())
                .policyId(c.getPolicyId())
                .policyNumber(policyNumber)
                .providerName(providerName)
                .patientId(c.getPatientId())
                .treatmentDescription(c.getTreatmentDescription())
                .hospitalName(c.getHospitalName() != null ? c.getHospitalName() : "HealthBridge Hospital")
                .branch(c.getBranch() != null ? c.getBranch() : "Colombo")
                .claimAmount(c.getClaimAmount())
                .approvedAmount(c.getApprovedAmount())
                .documentUrls(c.getDocumentUrls() != null ? c.getDocumentUrls() : new ArrayList<>())
                .documentFileIds(c.getDocumentFileIds() != null ? c.getDocumentFileIds() : new ArrayList<>())
                .status(c.getStatus())
                .rejectionReason(c.getRejectionReason())
                .submittedAt(c.getSubmittedAt())
                .reviewedAt(c.getReviewedAt())
                .build();
    }
}