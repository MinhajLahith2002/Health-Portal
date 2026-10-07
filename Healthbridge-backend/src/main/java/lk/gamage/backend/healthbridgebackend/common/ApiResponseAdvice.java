package lk.gamage.backend.healthbridgebackend.common;

import lk.gamage.backend.healthbridgebackend.dto.ErrorResponseDto;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.web.bind.annotation.ControllerAdvice;

/** Wraps legacy successful controller bodies without changing business modules. */
@ControllerAdvice
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType,
                            Class<? extends HttpMessageConverter<?>> converterType) {
        return returnType.getContainingClass().isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class)
            || returnType.getContainingClass().isAnnotationPresent(org.springframework.stereotype.Controller.class);
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                  MethodParameter returnType,
                                  MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request,
                                  ServerHttpResponse response) {
        if (body == null || body instanceof ApiResponse<?> || body instanceof ErrorResponseDto
                || body instanceof String || body instanceof byte[]) {
            return body;
        }

        int statusCode = response instanceof ServletServerHttpResponse servletResponse
            ? servletResponse.getServletResponse().getStatus()
            : 200;

        if (statusCode >= 400) {
            return ApiResponse.error(body, "Operation unsuccessful", statusCode);
        }

        return ApiResponse.success(body, "Operation successful", statusCode);
    }
}
