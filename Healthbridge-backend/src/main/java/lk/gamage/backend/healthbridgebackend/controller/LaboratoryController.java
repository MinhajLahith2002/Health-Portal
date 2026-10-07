package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.Laboratory;
import lk.gamage.backend.healthbridgebackend.repository.LaboratoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/laboratories")
public class LaboratoryController {

    @Autowired
    private LaboratoryRepository repository;

    @GetMapping
    public List<Laboratory> getAllLaboratories() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Laboratory> getLaboratory(@PathVariable String id) {
        return repository.findByLabId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Laboratory> updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return repository.findByLabId(id).map(lab -> {
            lab.setStatus(body.get("status"));
            if ("Approved".equals(body.get("status"))) {
                lab.setApprovedDate(java.time.LocalDate.now().toString());
            }
            return ResponseEntity.ok(repository.save(lab));
        }).orElse(ResponseEntity.notFound().build());
    }
}
