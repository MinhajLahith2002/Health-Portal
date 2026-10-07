package lk.gamage.backend.healthbridgebackend.util;

import lk.gamage.backend.healthbridgebackend.common.ApiResponse;
import lk.gamage.backend.healthbridgebackend.common.PageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public class ResponseUtil {

	private ResponseUtil() {
	}

	public static <T> ApiResponse<T> buildSuccessResponse(T data, String message, int statusCode) {
		return ApiResponse.success(data, message, statusCode);
	}

	public static <T> ApiResponse<T> buildSuccessResponse(T data, String message) {
		return ApiResponse.success(data, message);
	}

	public static <T> ApiResponse<PageResponse<T>> buildPageResponse(
			List<T> content, int currentPage, int pageSize, long totalElements, String message) {
		return ApiResponse.success(
				PageResponse.of(content, currentPage, pageSize, totalElements),
				message);
	}

	public static <T> ApiResponse<PageResponse<T>> buildPageResponse(Page<T> page, String message) {
		return ApiResponse.success(PageResponse.of(page), message);
	}
}
