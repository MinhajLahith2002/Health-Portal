package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.FamilyMemberRequest;
import lk.gamage.backend.healthbridgebackend.model.FamilyMember;
import lk.gamage.backend.healthbridgebackend.repository.FamilyMemberRepository;
import lk.gamage.backend.healthbridgebackend.service.FamilyMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FamilyMemberServiceImpl implements FamilyMemberService {

    @Autowired
    private FamilyMemberRepository repository;

    @Override
    public FamilyMember addFamilyMember(FamilyMemberRequest request) {
        FamilyMember member = new FamilyMember();
        member.setPrimaryPatientId(request.getPrimaryPatientId());
        member.setName(request.getName());
        member.setRelationship(request.getRelationship());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setLinkedEmail(request.getLinkedEmail());
        member.setAddedAt(LocalDateTime.now());
        
        return repository.save(member);
    }

    @Override
    public List<FamilyMember> getFamilyMembersByPatient(String patientId) {
        return repository.findByPrimaryPatientIdOrderByAddedAtDesc(patientId);
    }

    @Override
    public FamilyMember updateFamilyMember(String id, FamilyMemberRequest request) {
        FamilyMember existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Family member not found"));
        existing.setName(request.getName());
        existing.setRelationship(request.getRelationship());
        existing.setDateOfBirth(request.getDateOfBirth());
        existing.setLinkedEmail(request.getLinkedEmail());
        return repository.save(existing);
    }

    @Override
    public void deleteFamilyMember(String id) {
        repository.deleteById(id);
    }
}
