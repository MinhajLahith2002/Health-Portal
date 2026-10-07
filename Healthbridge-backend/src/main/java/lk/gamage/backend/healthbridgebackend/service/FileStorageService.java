package lk.gamage.backend.healthbridgebackend.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.List;

public interface FileStorageService {
    String store(MultipartFile file);
    InputStream retrieve(String fileId);
    String getContentType(String fileId);
    void delete(String fileId);
}