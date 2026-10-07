package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.UpdateTicketStatusRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.UpdateTicketReplyRequest;
import lk.gamage.backend.healthbridgebackend.service.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/tickets")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminSupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;

    @GetMapping
    public ResponseEntity<?> getAllTickets() {
        try {
            return ResponseEntity.ok(supportTicketService.getAllTickets());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving tickets: " + e.getMessage()));
        }
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> getAllFeedback() {
        try {
            return ResponseEntity.ok(supportTicketService.getPublicFeedback());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving feedback: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(supportTicketService.getTicketByIdForAdmin(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving ticket: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody UpdateTicketStatusRequest request) {
        try {
            return ResponseEntity.ok(supportTicketService.updateStatus(id, request.getStatus()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating status: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}/reply", consumes = "multipart/form-data")
    public ResponseEntity<?> reply(
            @PathVariable String id,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(supportTicketService.addAdminReply(id, message, image));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error adding reply: " + e.getMessage()));
        }
    }

    @PutMapping("/{ticketId}/reply/{replyId}")
    public ResponseEntity<?> editReply(
            @PathVariable String ticketId,
            @PathVariable String replyId,
            @RequestBody UpdateTicketReplyRequest request) {
        try {
            return ResponseEntity.ok(supportTicketService.editAdminReply(ticketId, replyId, request.getMessage()));
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
            return ResponseEntity.ok(supportTicketService.deleteAdminReply(ticketId, replyId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting reply: " + e.getMessage()));
        }
    }
}