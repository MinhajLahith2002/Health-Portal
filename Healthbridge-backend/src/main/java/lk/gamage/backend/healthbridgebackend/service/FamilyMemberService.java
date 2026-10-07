package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.FamilyMemberRequest;
import lk.gamage.backend.healthbridgebackend.model.FamilyMember;
import java.util.List;

public interface FamilyMemberService {
    FamilyMember addFamilyMember(FamilyMemberRequest request);
    List<FamilyMember> getFamilyMembersByPatient(String patientId);
    FamilyMember updateFamilyMember(String id, FamilyMemberRequest request);
    void deleteFamilyMember(String id);
}
