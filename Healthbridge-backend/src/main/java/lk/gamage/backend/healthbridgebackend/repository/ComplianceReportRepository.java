package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.ComplianceReport;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ComplianceReportRepository
        extends MongoRepository<ComplianceReport, String> {

    List<ComplianceReport>
    findByHospitalId(String hospitalId);
}