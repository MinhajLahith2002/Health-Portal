package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.LabSample;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LabSampleRepository extends MongoRepository<LabSample, String> {

    Optional<LabSample> findByBarcodeId(String barcodeId);
    List<LabSample> findByTestOrderId(String testOrderId);
    List<LabSample> findByStatus(LabSample.SampleStatus status);
}
