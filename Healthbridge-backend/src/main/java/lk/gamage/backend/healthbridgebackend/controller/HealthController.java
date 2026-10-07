package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.util.MongoDBConnectionTester;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthController {

    @Autowired
    private MongoDBConnectionTester mongoDBTester;

    /**
     * Basic health check endpoint
     * GET /api/health
     */
    @GetMapping
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Health Bridge Backend is running");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "1.0.0");

        return ResponseEntity.ok(response);
    }

    /**
     * Test MongoDB connection
     * GET /api/health/mongodb
     */
    @GetMapping("/mongodb")
    public ResponseEntity<?> mongodbHealth() {
        try {
            Map<String, Object> testResult = mongoDBTester.testConnection();

            if ("SUCCESS".equals(testResult.get("status"))) {
                return ResponseEntity.ok(testResult);
            } else {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(testResult);
            }

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "FAILED");
            errorResponse.put("message", "MongoDB health check failed");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }

    /**
     * Get MongoDB connection information
     * GET /api/health/mongodb/info
     */
    @GetMapping("/mongodb/info")
    public ResponseEntity<?> mongodbInfo() {
        try {
            Map<String, Object> info = mongoDBTester.getConnectionInfo();
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "FAILED");
            errorResponse.put("message", "Failed to get MongoDB info: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }

    /**
     * List all MongoDB collections
     * GET /api/health/mongodb/collections
     */
    @GetMapping("/mongodb/collections")
    public ResponseEntity<?> mongodbCollections() {
        try {
            Map<String, Object> collections = mongoDBTester.listCollections();
            return ResponseEntity.ok(collections);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "FAILED");
            errorResponse.put("message", "Failed to list collections: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }

    /**
     * Complete system health check
     * GET /api/health/full
     */
    @GetMapping("/full")
    public ResponseEntity<?> fullHealthCheck() {
        Map<String, Object> fullCheck = new HashMap<>();

        // Application status
        fullCheck.put("application_status", "UP");
        fullCheck.put("application_timestamp", LocalDateTime.now());

        // MongoDB connection test
        Map<String, Object> mongodbTest = mongoDBTester.testConnection();
        fullCheck.put("mongodb", mongodbTest);

        // MongoDB info
        Map<String, Object> mongodbInfo = mongoDBTester.getConnectionInfo();
        fullCheck.put("mongodb_info", mongodbInfo);

        // Collections
        Map<String, Object> collections = mongoDBTester.listCollections();
        fullCheck.put("collections", collections);

        // Overall status
        boolean isHealthy = "SUCCESS".equals(mongodbTest.get("status"));
        fullCheck.put("overall_status", isHealthy ? "HEALTHY" : "UNHEALTHY");

        HttpStatus statusCode = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

        return ResponseEntity.status(statusCode).body(fullCheck);
    }
}
