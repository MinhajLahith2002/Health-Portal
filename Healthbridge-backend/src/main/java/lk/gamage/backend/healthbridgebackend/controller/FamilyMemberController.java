package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.FamilyMemberRequest;
import lk.gamage.backend.healthbridgebackend.model.FamilyMember;
import lk.gamage.backend.healthbridgebackend.service.FamilyMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family-members")
public class FamilyMemberController {

    @Autowired
    private FamilyMemberService service;

    @PostMapping
    public ResponseEntity<FamilyMember> addFamilyMember(@RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(service.addFamilyMember(request));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<FamilyMember>> getPatientFamilyMembers(@PathVariable String patientId) {
        return ResponseEntity.ok(service.getFamilyMembersByPatient(patientId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyMember> updateFamilyMember(@PathVariable String id, @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(service.updateFamilyMember(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamilyMember(@PathVariable String id) {
        service.deleteFamilyMember(id);
        return ResponseEntity.ok().build();
    }
}
