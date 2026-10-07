package lk.gamage.backend.healthbridgebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HealthbridgeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthbridgeBackendApplication.class, args);
    }

}
