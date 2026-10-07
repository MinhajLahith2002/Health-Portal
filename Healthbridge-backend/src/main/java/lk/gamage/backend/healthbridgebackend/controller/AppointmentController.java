package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import lk.gamage.backend.healthbridgebackend.dto.request.AppointmentBookingRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.AppointmentRescheduleRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.AppointmentBookingResponse;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;
    public AppointmentController(AppointmentService service) { this.service = service; }

    @PostMapping("/book") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('PATIENT')")
    public AppointmentBookingResponse book(@AuthenticationPrincipal CustomUserDetails user, @Valid @RequestBody AppointmentBookingRequest request) { return service.book(user.getId(), request); }
    @GetMapping("/my") @PreAuthorize("hasRole('PATIENT')")
    public List<AppointmentBookingResponse> mine(@AuthenticationPrincipal CustomUserDetails user) { return service.findMine(user.getId()); }
    @GetMapping("/{id}") @PreAuthorize("isAuthenticated()")
    public AppointmentBookingResponse get(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) { return service.findOwned(id, user.getId(), user.getRole()); }
    @PatchMapping("/{id}/cancel") @PreAuthorize("hasRole('PATIENT')")
    public AppointmentBookingResponse cancel(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id, @RequestParam(required=false) String reason) { return service.cancel(id, user.getId(), reason); }
    @PatchMapping("/{id}/reschedule") @PreAuthorize("hasRole('PATIENT')")
    public AppointmentBookingResponse reschedule(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id, @Valid @RequestBody AppointmentRescheduleRequest request) { return service.reschedule(id, user.getId(), request.sessionId()); }
    @PatchMapping("/{id}/queue-status") @PreAuthorize("hasRole('DOCTOR')")
    public AppointmentBookingResponse queueStatus(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id, @RequestParam String status) { return service.updateQueueAppointment(id, user.getId(), status); }
}
