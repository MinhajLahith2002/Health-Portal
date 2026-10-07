package lk.gamage.backend.healthbridgebackend.controller;

import java.time.LocalDate;
import java.util.List;
import lk.gamage.backend.healthbridgebackend.dto.response.PublicDoctorSessionResponse;
import lk.gamage.backend.healthbridgebackend.service.DoctorSessionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/doctor-sessions")
public class PublicDoctorSessionController {
    private final DoctorSessionService service;
    public PublicDoctorSessionController(DoctorSessionService service) { this.service = service; }

    @GetMapping("/search")
    public List<PublicDoctorSessionResponse> search(
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) String hospitalId,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) LocalDate date) {
        return service.search(doctorId, hospitalId, specialization, date).stream()
                .map(response -> service.toPublicResponse(service.require(response.sessionId())))
                .toList();
    }

    @GetMapping("/{id}")
    public PublicDoctorSessionResponse get(@PathVariable String id) {
        return service.toPublicResponse(service.require(id));
    }
}
