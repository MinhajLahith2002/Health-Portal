package lk.gamage.backend.healthbridgebackend.common;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class ApiResponseAdviceTest {

    private final MockMvc mockMvc = standaloneSetup(new LegacyController())
            .setControllerAdvice(new ApiResponseAdvice())
            .build();

    @Test
    void wrapsLegacyControllerBody() throws Exception {
        mockMvc.perform(get("/legacy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.value").value("ok"));
    }

    @RestController
    static class LegacyController {
        @GetMapping("/legacy")
        Map<String, String> get() {
            return Map.of("value", "ok");
        }
    }
}