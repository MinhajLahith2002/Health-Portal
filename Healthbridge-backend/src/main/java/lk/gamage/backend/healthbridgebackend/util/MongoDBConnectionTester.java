package lk.gamage.backend.healthbridgebackend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class MongoDBConnectionTester {

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Test MongoDB connection by performing a simple ping operation
     */
    public Map<String, Object> testConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Try to get the database
            String dbName = mongoTemplate.getDb().getName();
            
            // Try to execute a simple command
            Map<String, Object> dbStats = mongoTemplate.executeCommand("{ ping: 1 }");
            
            result.put("status", "SUCCESS");
            result.put("message", "MongoDB connection is working!");
            result.put("database", dbName);
            result.put("timestamp", LocalDateTime.now());
            result.put("ping_response", dbStats);
            
            return result;
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "MongoDB connection failed: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
            result.put("timestamp", LocalDateTime.now());
            result.put("details", e.toString());
            
            return result;
        }
    }

    /**
     * Get detailed MongoDB connection information
     */
    public Map<String, Object> getConnectionInfo() {
        Map<String, Object> info = new HashMap<>();
        
        try {
            String dbName = mongoTemplate.getDb().getName();
            info.put("database_name", dbName);
            info.put("connected", true);
            
            // Try to get server info
            Map<String, Object> serverInfo = mongoTemplate.executeCommand("{ serverStatus: 1 }");
            info.put("server_info_available", serverInfo != null && !serverInfo.isEmpty());
            
            info.put("timestamp", LocalDateTime.now());
            
            return info;
            
        } catch (Exception e) {
            info.put("connected", false);
            info.put("error", e.getMessage());
            info.put("timestamp", LocalDateTime.now());
            
            return info;
        }
    }

    /**
     * List all collections in the database
     */
    public Map<String, Object> listCollections() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            var collectionNames = mongoTemplate.getCollectionNames();
            
            result.put("status", "SUCCESS");
            result.put("collection_count", collectionNames.size());
            result.put("collections", collectionNames);
            result.put("timestamp", LocalDateTime.now());
            
            return result;
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "Failed to list collections: " + e.getMessage());
            result.put("timestamp", LocalDateTime.now());
            
            return result;
        }
    }
}
