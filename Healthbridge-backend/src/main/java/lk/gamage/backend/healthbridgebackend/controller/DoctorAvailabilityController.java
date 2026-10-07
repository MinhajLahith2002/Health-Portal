package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.DoctorAvailability;
import lk.gamage.backend.healthbridgebackend.service.DoctorAvailabilityService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors/me/availability")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class DoctorAvailabilityController {
    private final DoctorAvailabilityService service;
    public DoctorAvailabilityController(DoctorAvailabilityService service) { this.service = service; }
    @GetMapping public List<DoctorAvailability> get(@RequestParam String doctorId) { return service.find(doctorId); }
    @PutMapping public List<DoctorAvailability> replace(@RequestParam String doctorId, @RequestBody List<DoctorAvailability> slots) { return service.replace(doctorId, slots); }
}