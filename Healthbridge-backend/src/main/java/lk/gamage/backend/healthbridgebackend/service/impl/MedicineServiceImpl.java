package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.MedicineDto;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Medicine;
import lk.gamage.backend.healthbridgebackend.repository.MedicineRepository;
import lk.gamage.backend.healthbridgebackend.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    @Override
    public MedicineDto.Response create(MedicineDto.Request request) {
        Medicine medicine = Medicine.builder()
                .medicineCode(request.getMedicineCode())
                .name(request.getName())
                .genericName(request.getGenericName())
                .brand(request.getBrand())
                .manufacturer(request.getManufacturer())
                .category(request.getCategory())
                .dosageForm(request.getDosageForm())
                .strength(request.getStrength())
                .controlledDrug(request.isControlledDrug())
                .prescriptionRequired(request.isPrescriptionRequired())
                .unitPrice(request.getUnitPrice())
                .build();
        return toResponse(medicineRepository.save(medicine));
    }

    @Override
    public MedicineDto.Response update(String id, MedicineDto.Request request) {
        Medicine medicine = getEntity(id);
        medicine.setName(request.getName());
        medicine.setGenericName(request.getGenericName());
        medicine.setBrand(request.getBrand());
        medicine.setCategory(request.getCategory());
        medicine.setDosageForm(request.getDosageForm());
        medicine.setStrength(request.getStrength());
        medicine.setPrescriptionRequired(request.isPrescriptionRequired());
        medicine.setUnitPrice(request.getUnitPrice());
        return toResponse(medicineRepository.save(medicine));
    }

    @Override
    public MedicineDto.Response getById(String id) {
        return toResponse(getEntity(id));
    }

    @Override
    public List<MedicineDto.Response> getAll() {
        return medicineRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<MedicineDto.Response> searchByName(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        medicineRepository.deleteById(id);
    }

    private Medicine getEntity(String id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + id));
    }

    private MedicineDto.Response toResponse(Medicine m) {
        MedicineDto.Response r = new MedicineDto.Response();
        r.setId(m.getId());
        r.setMedicineCode(m.getMedicineCode());
        r.setName(m.getName());
        r.setGenericName(m.getGenericName());
        r.setBrand(m.getBrand());
        r.setCategory(m.getCategory());
        r.setDosageForm(m.getDosageForm());
        r.setStrength(m.getStrength());
        r.setPrescriptionRequired(m.isPrescriptionRequired());
        r.setUnitPrice(m.getUnitPrice());
        return r;
    }
}