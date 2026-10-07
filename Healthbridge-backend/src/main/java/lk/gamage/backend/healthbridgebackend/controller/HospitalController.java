package lk.gamage.backend.healthbridgebackend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "http://localhost:3000")
public class HospitalController {

    // ============================================================
    // GET ALL HOSPITALS
    // ============================================================
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllHospitals() {
        log.info("📥 GET /api/hospitals - Fetching all hospitals");

        List<Map<String, Object>> hospitals = new ArrayList<>();

        hospitals.add(createHospital(
                "HOSP-001",
                "City General Hospital",
                "123 Main Street, Colombo 01",
                "+94-11-2345678",
                "info@citygeneral.lk",
                "GENERAL"
        ));

        hospitals.add(createHospital(
                "HOSP-002",
                "St. Mary's Medical Center",
                "45 Church Road, Kandy",
                "+94-81-2234567",
                "info@stmarys.lk",
                "SPECIALIZED"
        ));

        hospitals.add(createHospital(
                "HOSP-003",
                "National Hospital Colombo",
                "Regent Street, Colombo 08",
                "+94-11-2691111",
                "info@nhc.lk",
                "GOVERNMENT"
        ));

        hospitals.add(createHospital(
                "HOSP-004",
                "Asiri Central Hospital",
                "Nawala Road, Nugegoda",
                "+94-11-4523300",
                "info@asiri.lk",
                "PRIVATE"
        ));

        hospitals.add(createHospital(
                "HOSP-005",
                "Lanka Hospitals",
                "578 Elvitigala Mawatha, Colombo 05",
                "+94-11-5430000",
                "info@lankahospitals.lk",
                "PRIVATE"
        ));

        log.info("✅ Returning {} hospitals", hospitals.size());
        return ResponseEntity.ok(hospitals);
    }

    // ============================================================
    // GET HOSPITAL BY ID
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getHospital(
            @PathVariable String id) {

        log.info("📥 GET /api/hospitals/{} - Fetching hospital", id);

        Map<String, Object> hospital = new HashMap<>();
        hospital.put("id", id);
        hospital.put("name", "Hospital " + id);
        hospital.put("address", "Address for " + id);
        hospital.put("phone", "+94-11-0000000");
        hospital.put("email", "contact@hospital.lk");
        hospital.put("type", "GENERAL");

        return ResponseEntity.ok(hospital);
    }

    // ============================================================
    // HELPER: Create Hospital Map
    // ============================================================
    private Map<String, Object> createHospital(
            String id,
            String name,
            String address,
            String phone,
            String email,
            String type) {

        Map<String, Object> hospital = new HashMap<>();
        hospital.put("id", id);
        hospital.put("name", name);
        hospital.put("address", address);
        hospital.put("phone", phone);
        hospital.put("email", email);
        hospital.put("type", type);

        return hospital;
    }
}