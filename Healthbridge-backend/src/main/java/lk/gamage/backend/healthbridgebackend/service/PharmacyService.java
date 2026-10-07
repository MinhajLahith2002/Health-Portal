package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.PharmacyDTOs;
import java.util.List;

public interface PharmacyService {
    PharmacyDTOs.Response register(PharmacyDTOs.Request request);
    PharmacyDTOs.Response updateProfile(String id, PharmacyDTOs.Request request);
    PharmacyDTOs.Response approve(String id);
    PharmacyDTOs.Response setActive(String id, boolean active);
    PharmacyDTOs.Response getById(String id);
    List<PharmacyDTOs.Response> getAllActive();
}