package lk.gamage.backend.healthbridgebackend;

import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class MongoDBConnectionTest {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private UserRepository userRepository;

    /**
     * Test 1: Verify MongoDB connection with ping
     */
    @Test
    public void testMongoDBConnection() {
        try {
            // Get database name
            String dbName = mongoTemplate.getDb().getName();
            assertNotNull(dbName, "Database name should not be null");
            assertTrue(dbName.length() > 0, "Database name should not be empty");
            
            System.out.println("✅ MongoDB Connection Test PASSED");
            System.out.println("   Database: " + dbName);
            
        } catch (Exception e) {
            fail("MongoDB connection test failed: " + e.getMessage());
        }
    }

    /**
     * Test 2: Verify database ping command
     */
    @Test
    public void testMongoDatabasePing() {
        try {
            var pingResult = mongoTemplate.executeCommand("{ ping: 1 }");
            assertNotNull(pingResult, "Ping result should not be null");
            assertTrue(pingResult.size() > 0, "Ping result should contain data");
            
            System.out.println("✅ MongoDB Ping Test PASSED");
            System.out.println("   Ping Response: " + pingResult);
            
        } catch (Exception e) {
            fail("MongoDB ping test failed: " + e.getMessage());
        }
    }

    /**
     * Test 3: Verify collection creation and CRUD operations
     */
    @Test
    public void testMongoDBCRUDOperations() {
        try {
            // Create a test user
            User testUser = User.builder()
                    .email("test-mongodb-connection@example.com")
                    .fullName("MongoDB Test User")
                    .password("testpassword")
                    .accountStatus("Active")
                    .build();

            // Save user
            User savedUser = userRepository.save(testUser);
            assertNotNull(savedUser.getId(), "Saved user should have an ID");
            
            System.out.println("✅ MongoDB CRUD Test - CREATE PASSED");
            System.out.println("   User ID: " + savedUser.getId());

            // Read user
            Optional<User> retrievedUser = userRepository.findByEmail("test-mongodb-connection@example.com");
            assertTrue(retrievedUser.isPresent(), "User should be found by email");
            assertEquals("MongoDB Test User", retrievedUser.get().getFullName());
            
            System.out.println("✅ MongoDB CRUD Test - READ PASSED");
            System.out.println("   Retrieved: " + retrievedUser.get().getFullName());

            // Update user
            retrievedUser.get().setAccountStatus("Inactive");
            userRepository.save(retrievedUser.get());
            
            Optional<User> updatedUser = userRepository.findByEmail("test-mongodb-connection@example.com");
            assertEquals("Inactive", updatedUser.get().getAccountStatus());
            
            System.out.println("✅ MongoDB CRUD Test - UPDATE PASSED");

            // Delete user
            userRepository.delete(updatedUser.get());
            Optional<User> deletedUser = userRepository.findByEmail("test-mongodb-connection@example.com");
            assertFalse(deletedUser.isPresent(), "User should be deleted");
            
            System.out.println("✅ MongoDB CRUD Test - DELETE PASSED");

        } catch (Exception e) {
            fail("MongoDB CRUD test failed: " + e.getMessage());
        }
    }

    /**
     * Test 4: Verify collection exists
     */
    @Test
    public void testCollectionExists() {
        try {
            var collections = mongoTemplate.getCollectionNames();
            assertNotNull(collections, "Collections list should not be null");
            
            System.out.println("✅ MongoDB Collections Test PASSED");
            System.out.println("   Total Collections: " + collections.size());
            System.out.println("   Collections: " + collections);
            
        } catch (Exception e) {
            fail("MongoDB collections test failed: " + e.getMessage());
        }
    }

    /**
     * Test 5: Verify index creation
     */
    @Test
    public void testIndexCreation() {
        try {
            // Check if indexes for User collection exist
            var indexInfo = mongoTemplate.indexOps(User.class).getIndexInfo();
            assertNotNull(indexInfo, "Index info should not be null");
            assertTrue(indexInfo.size() > 0, "Should have at least one index");
            
            System.out.println("✅ MongoDB Index Creation Test PASSED");
            System.out.println("   Total Indexes: " + indexInfo.size());
            
        } catch (Exception e) {
            fail("MongoDB index creation test failed: " + e.getMessage());
        }
    }

    /**
     * Test 6: Connection string validation
     */
    @Test
    public void testConnectionStringIsValid() {
        try {
            String dbName = mongoTemplate.getDb().getName();
            
            // The database should be accessible
            assertNotNull(dbName);
            
            // Try a simple query
            long userCount = userRepository.count();
            assertGreaterThanOrEqual(userCount, 0L, "User count should be non-negative");
            
            System.out.println("✅ Connection String Validation Test PASSED");
            System.out.println("   Database: " + dbName);
            System.out.println("   Total Users in DB: " + userCount);
            
        } catch (Exception e) {
            fail("Connection string validation failed: " + e.getMessage());
        }
    }

    /**
     * Helper method to assert greater than or equal
     */
    private void assertGreaterThanOrEqual(long actual, long expected, String message) {
        assertTrue(actual >= expected, message + " (actual: " + actual + ", expected: >= " + expected + ")");
    }
}
