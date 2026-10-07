package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lk.gamage.backend.healthbridgebackend.dto.request.DoctorSessionRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.AppointmentBookingResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.DoctorSessionResponse;
import lk.gamage.backend.healthbridgebackend.enums.SessionStatus;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.AppointmentService;
import lk.gamage.backend.healthbridgebackend.service.DoctorSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctor-sessions")
public class DoctorSessionController {
    private final DoctorSessionService service;
    private final AppointmentService appointments;
    public DoctorSessionController(DoctorSessionService service, AppointmentService appointments) { this.service = service; this.appointments = appointments; }

    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('DOCTOR')")
    public DoctorSessionResponse create(@AuthenticationPrincipal CustomUserDetails user, @Valid @RequestBody DoctorSessionRequest request) { return service.create(user.getId(), request); }
    @GetMapping("/mine") @PreAuthorize("hasRole('DOCTOR')")
    public List<DoctorSessionResponse> mine(@AuthenticationPrincipal CustomUserDetails user) { return service.mine(user.getId()); }
    @GetMapping("/search") @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN','SUPER_ADMIN')")
    public List<DoctorSessionResponse> search(@RequestParam(required=false) String doctorId, @RequestParam(required=false) String hospitalId,
            @RequestParam(required=false) String specialization, @RequestParam(required=false) LocalDate date) { return service.search(doctorId, hospitalId, specialization, date); }
    @GetMapping("/{id}") @PreAuthorize("isAuthenticated()") public DoctorSessionResponse get(@PathVariable String id) { return service.get(id); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('DOCTOR')")
    public DoctorSessionResponse update(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id, @Valid @RequestBody DoctorSessionRequest request) { return service.update(user.getId(), id, request); }
    @PatchMapping("/{id}/status") @PreAuthorize("hasRole('DOCTOR')")
    public DoctorSessionResponse status(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id, @RequestParam SessionStatus status) { return service.setStatus(user.getId(), id, status); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('DOCTOR')")
    public void delete(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) { service.delete(user.getId(), id); }
    @GetMapping("/{id}/appointments") @PreAuthorize("hasRole('DOCTOR')")
    public List<AppointmentBookingResponse> appointments(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) { return appointments.queue(id, user.getId()); }
    @GetMapping("/{id}/queue") @PreAuthorize("hasRole('DOCTOR')")
    public List<AppointmentBookingResponse> queue(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id) { return appointments.queue(id, user.getId()); }
    @PatchMapping("/{id}/queue/current") @PreAuthorize("hasRole('DOCTOR')")
    public DoctorSessionResponse queueCurrent(@AuthenticationPrincipal CustomUserDetails user, @PathVariable String id,
            @RequestParam(required=false) Integer currentNumber, @RequestParam(required=false) String action) { return service.updateQueue(user.getId(), id, currentNumber, action); }
}
