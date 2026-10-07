package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.AddContactRequest;
import lk.gamage.backend.healthbridgebackend.model.EmergencyContact;
import lk.gamage.backend.healthbridgebackend.service.SOSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final SOSService sosService;

    @GetMapping
    public ResponseEntity<Map<String, List<EmergencyContact>>> getContacts(@RequestParam String userId) {
        List<EmergencyContact> contacts = sosService.getContacts(userId);
        
        Map<String, List<EmergencyContact>> response = new HashMap<>();
        response.put("contacts", contacts);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> addContact(@RequestBody AddContactRequest request,
                                                          @RequestParam String userId) {
        EmergencyContact contact = sosService.addContact(userId, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("id", contact.getId());
        response.put("message", "Contact added successfully!");
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<Map<String, String>> updateContact(@PathVariable String contactId,
                                                             @RequestBody AddContactRequest request) {
        sosService.updateContact(contactId, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contact updated successfully!");
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<Map<String, String>> deleteContact(@PathVariable String contactId) {
        sosService.deleteContact(contactId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contact removed successfully!");
        
        return ResponseEntity.ok(response);
    }
}
