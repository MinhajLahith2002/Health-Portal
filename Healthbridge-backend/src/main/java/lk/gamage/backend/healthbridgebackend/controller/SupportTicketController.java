package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.SubmitTicketFeedbackRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.UpdateTicketReplyRequest;
import lk.gamage.backend.healthbridgebackend.model.TicketCategory;
import lk.gamage.backend.healthbridgebackend.service.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class SupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createTicket(
            @RequestParam("subject") String subject,
            @RequestParam("description") String description,
                @RequestParam("category") TicketCategory category,
                @RequestParam("contactNumber") String contactNumber,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(supportTicketService.createTicket(subject, description, category, contactNumber, attachment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating ticket: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyTickets() {
        try {
            return ResponseEntity.ok(supportTicketService.getMyTickets());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving tickets: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMyTicketById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(supportTicketService.getMyTicketById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving ticket: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}/reply", consumes = "multipart/form-data")
    public ResponseEntity<?> reply(
            @PathVariable String id,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(supportTicketService.addUserReply(id, message, image));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error adding reply: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable String id,
            @RequestBody SubmitTicketFeedbackRequest request) {
        try {
            return ResponseEntity.ok(supportTicketService.submitFeedback(
                    id, request.getRating(), request.getComment()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error submitting feedback: " + e.getMessage()));
        }
    }

    @PutMapping("/{ticketId}/reply/{replyId}")
    public ResponseEntity<?> editReply(
            @PathVariable String ticketId,
            @PathVariable String replyId,
            @RequestBody UpdateTicketReplyRequest request) {
        try {
            return ResponseEntity.ok(supportTicketService.editUserReply(ticketId, replyId, request.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error editing reply: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{ticketId}/reply/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable String ticketId, @PathVariable String replyId) {
        try {
            return ResponseEntity.ok(supportTicketService.deleteUserReply(ticketId, replyId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting reply: " + e.getMessage()));
        }
    }

@GetMapping("/feedback/public")
public ResponseEntity<?> getPublicFeedback() {
    try {
        return ResponseEntity.ok(supportTicketService.getPublicFeedback());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error retrieving feedback: " + e.getMessage()));
    }
}



}