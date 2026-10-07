package lk.gamage.backend.healthbridgebackend.util;

import lk.gamage.backend.healthbridgebackend.common.ApiResponse;
import lk.gamage.backend.healthbridgebackend.common.PageResponse;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResponseUtilTest {

    @Test
    void buildsSuccessResponse() {
        ApiResponse<String> response = ResponseUtil.buildSuccessResponse("value", "Done", 201);

        assertTrue(response.isSuccess());
        assertEquals("value", response.getData());
        assertEquals("Done", response.getMessage());
        assertEquals(201, response.getStatusCode());
    }

    @Test
    void buildsPageResponseUsingBackendPaginationContract() {
        ApiResponse<PageResponse<String>> response = ResponseUtil.buildPageResponse(
                List.of("one", "two"), 0, 2, 3, "Loaded");

        PageResponse<String> page = response.getData();
        assertEquals(List.of("one", "two"), page.getContent());
        assertEquals(0, page.getCurrentPage());
        assertEquals(2, page.getPageSize());
        assertEquals(3, page.getTotalElements());
        assertEquals(2, page.getTotalPages());
        assertTrue(page.isHasNext());
    }

    @Test
    void convertsSpringPageToPageResponse() {
        PageImpl<String> source = new PageImpl<>(
                List.of("one"), PageRequest.of(1, 1), 2);

        PageResponse<String> page = ResponseUtil.buildPageResponse(source, "Loaded").getData();

        assertEquals(1, page.getCurrentPage());
        assertEquals(1, page.getPageSize());
        assertEquals(2, page.getTotalElements());
        assertTrue(page.isHasPrevious());
        assertTrue(!page.isHasNext());
    }

    @Test
    void rejectsNonPositivePageSize() {
        assertThrows(IllegalArgumentException.class,
                () -> PageResponse.of(List.of(), 0, 0, 0));
    }

    @Test
    void buildsEmptyPageResponse() {
        PageResponse<String> page = PageResponse.empty();

        assertTrue(page.isEmpty());
        assertTrue(page.getContent().isEmpty());
        assertEquals(0, page.getTotalElements());
    }
}
