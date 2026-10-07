package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.InsuranceProvider;
import lk.gamage.backend.healthbridgebackend.repository.InsuranceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/insurance-providers")
@RequiredArgsConstructor
public class InsuranceProviderController {

    private final InsuranceProviderRepository repository;

    @GetMapping
    public ResponseEntity<List<InsuranceProvider>> getAllProviders() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping("/seed")
    public ResponseEntity<String> seedData() {
        if (repository.count() == 0) {
            repository.saveAll(List.of(
                InsuranceProvider.builder()
                    .providerId("PRV-84920")
                    .logoText("BC")
                    .logoColor("bg-indigo-100 text-indigo-700")
                    .name("BlueCross Health")
                    .licenseNo("LCN-2023-A991")
                    .contactName("Sarah Jenkins")
                    .contactRole("Compliance Officer")
                    .coverageRegions(List.of("North America", "EU"))
                    .status("Approved")
                    .build(),
                InsuranceProvider.builder()
                    .providerId("PRV-84921")
                    .logoText("MN")
                    .logoColor("bg-orange-100 text-orange-700")
                    .name("MediNet Global")
                    .licenseNo("LCN-2023-B442")
                    .contactName("David Chen")
                    .contactRole("Director of Ops")
                    .coverageRegions(List.of("APAC"))
                    .status("Pending")
                    .build(),
                InsuranceProvider.builder()
                    .providerId("PRV-84918")
                    .logoText("UA")
                    .logoColor("bg-red-100 text-red-700")
                    .name("United Assurance")
                    .licenseNo("LCN-2022-X109")
                    .contactName("Robert Vance")
                    .contactRole("Legal Rep")
                    .coverageRegions(List.of("North America", "LATAM"))
                    .status("Suspended")
                    .build(),
                InsuranceProvider.builder()
                    .providerId("PRV-84955")
                    .logoText("AE")
                    .logoColor("bg-blue-100 text-blue-700")
                    .name("Aetna Equinox")
                    .licenseNo("LCN-2024-C881")
                    .contactName("Maria Gonzalez")
                    .contactRole("VP Relations")
                    .coverageRegions(List.of("Global"))
                    .status("Approved")
                    .build()
            ));
            return ResponseEntity.ok("Seeded successfully");
        }
        return ResponseEntity.ok("Already seeded");
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<InsuranceProvider> updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        return repository.findByProviderId(id).map(provider -> {
            provider.setStatus(body.get("status"));
            return ResponseEntity.ok(repository.save(provider));
        }).orElse(ResponseEntity.notFound().build());
    }
}
