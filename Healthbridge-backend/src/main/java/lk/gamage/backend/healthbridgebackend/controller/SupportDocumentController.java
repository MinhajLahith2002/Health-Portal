package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.SupportDocument;
import lk.gamage.backend.healthbridgebackend.service.SupportDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support/documents")
public class SupportDocumentController {

    @Autowired
    private SupportDocumentService service;

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadDocument(
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart("file") MultipartFile file
    ) {
        try {
            SupportDocument document = service.uploadDocument(
                    category,
                    description,
                    file
            );

            return ResponseEntity.ok(document);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<SupportDocument>> getAllDocuments() {
        return ResponseEntity.ok(service.getAllDocuments());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SupportDocument>> getByCategory(
            @PathVariable String category
    ) {
        return ResponseEntity.ok(service.getByCategory(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable String id
    ) {
        try {

            service.deleteDocument(id);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Support document deleted successfully"
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}