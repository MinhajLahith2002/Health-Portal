package lk.gamage.backend.healthbridgebackend.service.impl;

import com.mongodb.client.gridfs.model.GridFSFile;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.service.FileStorageService;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf", "image/jpeg", "image/png"
    );
    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    private final GridFsTemplate gridFsTemplate;

    public FileStorageServiceImpl(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only PDF, JPEG, or PNG files are allowed");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("File exceeds 10MB limit");
        }
        try {
            ObjectId id = gridFsTemplate.store(
                    file.getInputStream(), file.getOriginalFilename(), file.getContentType());
            return id.toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public InputStream retrieve(String fileId) {
        GridFSFile gridFsFile = gridFsTemplate.findOne(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("_id").is(new ObjectId(fileId))));
        if (gridFsFile == null) {
            throw new ResourceNotFoundException("File not found: " + fileId);
        }
        try {
            return gridFsTemplate.getResource(gridFsFile).getInputStream();
        } catch (IOException e) {
            throw new ResourceNotFoundException("Could not read file: " + fileId);
        }
    }

    @Override
    public String getContentType(String fileId) {
        GridFSFile gridFsFile = gridFsTemplate.findOne(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("_id").is(new ObjectId(fileId))));
        return gridFsFile != null && gridFsFile.getMetadata() != null
                ? gridFsFile.getMetadata().getString("_contentType")
                : "application/octet-stream";
    }

    @Override
    public void delete(String fileId) {
        gridFsTemplate.delete(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("_id").is(new ObjectId(fileId))));
    }
}