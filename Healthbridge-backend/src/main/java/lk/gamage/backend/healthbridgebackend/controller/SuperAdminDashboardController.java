package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.SuperAdminDTOs;
import lk.gamage.backend.healthbridgebackend.service.SuperAdminDashboardService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/super-admin/dashboard")
@RequiredArgsConstructor
public class SuperAdminDashboardController {

    private final SuperAdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<SuperAdminDTOs.Stats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/growth")
    public ResponseEntity<List<SuperAdminDTOs.Growth>> getGrowthData() {
        return ResponseEntity.ok(dashboardService.getGrowthData());
    }

    @GetMapping(value = "/report", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getDashboardReport() {
        return ResponseEntity.ok(dashboardService.generateDashboardReport());
    }

    @GetMapping("/analytics")
    public ResponseEntity<SuperAdminDTOs.SystemAnalytics> getSystemAnalytics() {
        return ResponseEntity.ok(dashboardService.getSystemAnalytics());
    }

    @GetMapping(value = "/analytics/report", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getAnalyticsReport() {
        return ResponseEntity.ok(dashboardService.generateAnalyticsReport());
    }
}
