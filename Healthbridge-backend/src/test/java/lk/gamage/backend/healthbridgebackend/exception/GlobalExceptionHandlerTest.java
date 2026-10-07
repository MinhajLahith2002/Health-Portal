package lk.gamage.backend.healthbridgebackend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class GlobalExceptionHandlerTest {

    private final MockMvc mockMvc = standaloneSetup(new FailingController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void formatsNotFoundErrorsUsingSharedContract() throws Exception {
        mockMvc.perform(get("/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Patient was not found"))
                .andExpect(jsonPath("$.path").value("/missing"));
    }

    @RestController
    static class FailingController {
        @GetMapping("/missing")
        String get() {
            throw new ResourceNotFoundException("Patient was not found");
        }
    }
}