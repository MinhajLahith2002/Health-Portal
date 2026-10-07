package lk.gamage.backend.healthbridgebackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables @Async so AiSummaryGenerator can run summary generation off the
 * request thread. If another config class in the project already declares
 * @EnableAsync, delete this file to avoid a duplicate-bean conflict.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
