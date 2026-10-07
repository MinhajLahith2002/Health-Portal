package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.MedicineDto;

import java.util.List;

public interface MedicineService {
    MedicineDto.Response create(MedicineDto.Request request);
    MedicineDto.Response update(String id, MedicineDto.Request request);
    MedicineDto.Response getById(String id);
    List<MedicineDto.Response> getAll();
    List<MedicineDto.Response> searchByName(String name);
    void delete(String id);
}