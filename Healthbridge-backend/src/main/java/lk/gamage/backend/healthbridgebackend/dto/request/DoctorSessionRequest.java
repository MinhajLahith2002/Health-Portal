package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;

public record DoctorSessionRequest(
        String doctorId,
        @NotBlank String hospitalId,
        @NotBlank String hospitalName,
        String specializationId,
        @NotBlank String specializationName,
        @NotNull LocalDate sessionDate,
        @NotNull LocalTime startTime,
        LocalTime endTime,
        @Positive int maxAppointments,
        String notes,
        /** "VIDEO" or "IN_PERSON". Optional — defaults to IN_PERSON if blank. */
        String appointmentType) {

    public DoctorSessionRequest(
            String doctorId,
            @NotBlank String hospitalId,
            @NotBlank String hospitalName,
            String specializationId,
            @NotBlank String specializationName,
            @NotNull LocalDate sessionDate,
            @NotNull LocalTime startTime,
            LocalTime endTime,
            @Positive int maxAppointments,
            String notes) {
        this(doctorId, hospitalId, hospitalName, specializationId, specializationName,
                sessionDate, startTime, endTime, maxAppointments, notes, "IN_PERSON");
    }
}
