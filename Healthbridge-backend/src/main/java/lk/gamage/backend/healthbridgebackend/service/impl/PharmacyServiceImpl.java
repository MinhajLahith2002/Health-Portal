package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.PharmacyDTOs;

import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Pharmacy;
import lk.gamage.backend.healthbridgebackend.repository.PharmacyRepository;
import lk.gamage.backend.healthbridgebackend.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacyServiceImpl implements PharmacyService {

    private final PharmacyRepository pharmacyRepository;

    @Override
    public PharmacyDTOs.Response register(PharmacyDTOs.Request request) {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setRegistrationNumber(request.getRegistrationNumber());
        pharmacy.setName(request.getName());
        pharmacy.setLicenseNumber(request.getLicenseNumber());
        pharmacy.setContactPerson(request.getContactPerson());
        pharmacy.setPhoneNumber(request.getPhoneNumber());
        pharmacy.setEmail(request.getEmail());
        pharmacy.setAddress(request.getAddress());
        pharmacy.setCity(request.getCity());
        pharmacy.setOperatingHours(request.getOperatingHours());
        pharmacy.setActive(true);
        pharmacy.setApproved(false);

        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return toResponse(saved);
    }

    @Override
    public PharmacyDTOs.Response updateProfile(String id, PharmacyDTOs.Request request) {
        Pharmacy pharmacy = getEntity(id);
        pharmacy.setName(request.getName());
        pharmacy.setContactPerson(request.getContactPerson());
        pharmacy.setPhoneNumber(request.getPhoneNumber());
        pharmacy.setEmail(request.getEmail());
        pharmacy.setAddress(request.getAddress());
        pharmacy.setCity(request.getCity());
        pharmacy.setOperatingHours(request.getOperatingHours());

        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return toResponse(saved);
    }

    @Override
    public PharmacyDTOs.Response approve(String id) {
        Pharmacy pharmacy = getEntity(id);
        pharmacy.setApproved(true);
        return toResponse(pharmacyRepository.save(pharmacy));
    }

    @Override
    public PharmacyDTOs.Response setActive(String id, boolean active) {
        Pharmacy pharmacy = getEntity(id);
        pharmacy.setActive(active);
        return toResponse(pharmacyRepository.save(pharmacy));
    }

    @Override
    public PharmacyDTOs.Response getById(String id) {
        return toResponse(getEntity(id));
    }

    @Override
    public List<PharmacyDTOs.Response> getAllActive() {
        return pharmacyRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Pharmacy getEntity(String id) {
        return pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found: " + id));
    }

    private PharmacyDTOs.Response toResponse(Pharmacy pharmacy) {
        PharmacyDTOs.Response response = new PharmacyDTOs.Response();
        response.setId(pharmacy.getId());
        response.setRegistrationNumber(pharmacy.getRegistrationNumber());
        response.setName(pharmacy.getName());
        response.setLicenseNumber(pharmacy.getLicenseNumber());
        response.setContactPerson(pharmacy.getContactPerson());
        response.setPhoneNumber(pharmacy.getPhoneNumber());
        response.setEmail(pharmacy.getEmail());
        response.setAddress(pharmacy.getAddress());
        response.setCity(pharmacy.getCity());
        response.setActive(pharmacy.isActive());
        response.setApproved(pharmacy.isApproved());
        return response;
    }
}