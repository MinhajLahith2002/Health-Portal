package lk.gamage.backend.healthbridgebackend.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard Pagination Response wrapper for list endpoints.
 * Used by all controllers that return paginated data.
 * 
 * Example:
 * {
 *   "success": true,
 *   "data": {
 *     "content": [ ... ],
 *     "currentPage": 1,
 *     "pageSize": 10,
 *     "totalElements": 150,
 *     "totalPages": 15,
 *     "hasNext": true,
 *     "hasPrevious": false,
 *     "isEmpty": false
 *   },
 *   "message": "Data retrieved successfully",
 *   "statusCode": 200,
 *   "timestamp": "2026-08-31T10:30:00"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    
    private List<T> content;
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean isEmpty;
    
    /**
     * Build a paginated response from list data
     * 
     * @param content List of items
     * @param currentPage Zero-indexed page number
     * @param pageSize Items per page
     * @param totalElements Total number of elements
     */
    public static <T> PageResponse<T> of(List<T> content, int currentPage, int pageSize, long totalElements) {
        if (pageSize <= 0) {
            throw new IllegalArgumentException("Page size must be greater than zero");
        }

        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        boolean hasNext = currentPage < totalPages - 1;
        boolean hasPrevious = currentPage > 0;
        boolean isEmpty = content == null || content.isEmpty();
        
        return PageResponse.<T>builder()
                .content(content)
                .currentPage(currentPage)
                .pageSize(pageSize)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .isEmpty(isEmpty)
                .build();
    }

    public static <T> PageResponse<T> of(Page<T> page) {
        return of(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
    }
    
    /**
     * Build an empty paginated response
     */
    public static <T> PageResponse<T> empty() {
        return PageResponse.<T>builder()
                .content(List.of())
                .currentPage(0)
                .pageSize(0)
                .totalElements(0)
                .totalPages(0)
                .hasNext(false)
                .hasPrevious(false)
                .isEmpty(true)
                .build();
    }
}
