package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.response.EhrPatientLookupResponse;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class EhrPatientLookupService {

    private final MongoTemplate mongoTemplate;
    private final MedicalRecordRepository medicalRecordRepository;


    public EhrPatientLookupService(
            MongoTemplate mongoTemplate,
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.mongoTemplate = mongoTemplate;
        this.medicalRecordRepository = medicalRecordRepository;
    }


    /*
     * =========================================================
     * SEARCH REGISTERED PATIENTS
     * =========================================================
     *
     * Blank:
     * -> ALL registered PATIENT users
     *
     * Text:
     * -> Name search only
     *
     * ID:
     * -> Exact MongoDB User ID
     *
     * Examples:
     *
     * "he"
     * -> Health
     *
     * "theshan"
     * -> Theshan Geethanjan
     *
     * "gee"
     * -> Theshan Geethanjan
     *
     * "theshan gee"
     * -> Theshan Geethanjan
     *
     * Exact patient ID
     * -> exact patient
     */
    public List<EhrPatientLookupResponse> searchPatients(
            String searchText
    ) {

        String normalizedSearch =
                searchText == null
                        ? ""
                        : searchText.trim();


        List<User> allPatients =
                findAllPatients();


        /*
         * Empty search:
         * return every registered PATIENT.
         */
        if (!StringUtils.hasText(normalizedSearch)) {

            return toResponses(
                    allPatients
            );
        }


        Map<String, User> matches =
                new LinkedHashMap<>();


        /*
         * =====================================================
         * EXACT PATIENT ID
         * =====================================================
         */
        try {

            User exactUser =
                    mongoTemplate.findById(
                            normalizedSearch,
                            User.class
                    );


            if (isPatient(exactUser)) {

                matches.put(
                        exactUser.getId(),
                        exactUser
                );
            }

        } catch (Exception ignored) {

            /*
             * Invalid / non Mongo ObjectId text is normal
             * during name searching.
             */
        }


        /*
         * =====================================================
         * NAME SEARCH
         * =====================================================
         */
        for (User patient : allPatients) {

            if (patient == null) {
                continue;
            }


            if (
                    !StringUtils.hasText(
                            patient.getId()
                    )
            ) {
                continue;
            }


            if (
                    matchesPatientName(
                            patient,
                            normalizedSearch
                    )
            ) {

                matches.putIfAbsent(
                        patient.getId(),
                        patient
                );
            }
        }


        return toResponses(
                new ArrayList<>(
                        matches.values()
                )
        );
    }


    /*
     * =========================================================
     * ALL REGISTERED PATIENTS
     * =========================================================
     */
    private List<User> findAllPatients() {

        Criteria patientRole =
                Criteria
                        .where("role")
                        .regex(
                                Pattern.compile(
                                        "^"
                                                + Pattern.quote(
                                                Role.PATIENT
                                        )
                                                + "$",
                                        Pattern.CASE_INSENSITIVE
                                )
                        );


        Query query =
                new Query(
                        patientRole
                );


        query.with(
                Sort.by(
                        Sort.Direction.ASC,
                        "fullName"
                )
        );


        List<User> users =
                mongoTemplate.find(
                        query,
                        User.class
                );


        List<User> patients =
                new ArrayList<>();


        for (User user : users) {

            if (isPatient(user)) {

                patients.add(
                        user
                );
            }
        }


        return patients;
    }


    /*
     * =========================================================
     * PATIENT NAME SEARCH
     * =========================================================
     *
     * Prefix-per-word search.
     *
     * Example:
     *
     * Patient:
     * Theshan Geethanjan
     *
     * Search "theshan"
     * -> YES
     *
     * Search "gee"
     * -> YES
     *
     * Search "theshan gee"
     * -> YES
     *
     * Search "he"
     * -> NO
     *
     * because "Theshan" starts with "th",
     * not "he".
     */
    private boolean matchesPatientName(
            User patient,
            String searchText
    ) {

        if (
                patient == null
                || !StringUtils.hasText(searchText)
        ) {

            return false;
        }


        String patientName =
                getPatientName(
                        patient
                );


        if (
                !StringUtils.hasText(
                        patientName
                )
        ) {

            return false;
        }


        String normalizedName =
                normalizeText(
                        patientName
                );


        String normalizedSearch =
                normalizeText(
                        searchText
                );


        if (
                !StringUtils.hasText(normalizedSearch)
        ) {

            return false;
        }


        String[] patientWords =
                normalizedName.split(
                        "\\s+"
                );


        String[] searchWords =
                normalizedSearch.split(
                        "\\s+"
                );


        /*
         * Every search word must match the
         * START of at least one patient-name word.
         */
        for (String searchWord : searchWords) {

            if (
                    !StringUtils.hasText(
                            searchWord
                    )
            ) {
                continue;
            }


            boolean tokenMatched =
                    false;


            for (String patientWord : patientWords) {

                if (
                        patientWord.startsWith(
                                searchWord
                        )
                ) {

                    tokenMatched =
                            true;

                    break;
                }
            }


            if (!tokenMatched) {

                return false;
            }
        }


        return true;
    }


    /*
     * =========================================================
     * PATIENT DISPLAY NAME
     * =========================================================
     */
    private String getPatientName(
            User patient
    ) {

        if (
                StringUtils.hasText(
                        patient.getFullName()
                )
        ) {

            return patient
                    .getFullName()
                    .trim();
        }


        return buildName(
                patient
        );
    }


    /*
     * =========================================================
     * DOCTOR -> MY EHR PATIENTS
     * =========================================================
     */
    public List<EhrPatientLookupResponse> getDoctorPatients(
            String doctorId
    ) {

        if (
                !StringUtils.hasText(
                        doctorId
                )
        ) {

            return List.of();
        }


        List<MedicalRecord> doctorRecords =
                medicalRecordRepository
                        .findByDoctorIdOrderByVisitDateDesc(
                                doctorId.trim()
                        );


        Map<String, DoctorPatientSummary> summaries =
                new LinkedHashMap<>();


        for (MedicalRecord record : doctorRecords) {

            if (record == null) {
                continue;
            }


            /*
             * Do not count archived records.
             */
            if (
                    Boolean.TRUE.equals(
                            record.getArchived()
                    )
            ) {

                continue;
            }


            if (
                    !StringUtils.hasText(
                            record.getPatientId()
                    )
            ) {

                continue;
            }


            String patientId =
                    record
                            .getPatientId()
                            .trim();


            DoctorPatientSummary summary =
                    summaries.computeIfAbsent(
                            patientId,
                            ignored ->
                                    new DoctorPatientSummary()
                    );


            summary.recordCount++;


            LocalDate visitDate =
                    record.getVisitDate();


            if (
                    visitDate != null
                    && (
                    summary.lastVisitDate == null
                            || visitDate.isAfter(
                            summary.lastVisitDate
                    )
            )
            ) {

                summary.lastVisitDate =
                        visitDate;
            }
        }


        if (summaries.isEmpty()) {

            return List.of();
        }


        Query usersQuery =
                new Query(
                        Criteria
                                .where("_id")
                                .in(
                                        summaries.keySet()
                                )
                );


        List<User> users =
                mongoTemplate.find(
                        usersQuery,
                        User.class
                );


        Map<String, User> usersById =
                new LinkedHashMap<>();


        for (User user : users) {

            if (!isPatient(user)) {
                continue;
            }


            usersById.put(
                    user.getId(),
                    user
            );
        }


        List<EhrPatientLookupResponse> results =
                new ArrayList<>();


        for (
                Map.Entry<
                        String,
                        DoctorPatientSummary
                        > entry
                : summaries.entrySet()
        ) {

            User patient =
                    usersById.get(
                            entry.getKey()
                    );


            if (patient == null) {
                continue;
            }


            DoctorPatientSummary summary =
                    entry.getValue();


            EhrPatientLookupResponse response =
                    toResponse(
                            patient
                    );


            response.setRecordCount(
                    summary.recordCount
            );


            response.setLastVisitDate(
                    summary.lastVisitDate == null
                            ? null
                            : summary
                            .lastVisitDate
                            .toString()
            );


            results.add(
                    response
            );
        }


        return results;
    }


    /*
     * =========================================================
     * ROLE CHECK
     * =========================================================
     */
    private boolean isPatient(
            User user
    ) {

        return user != null

                && StringUtils.hasText(
                user.getId()
        )

                && StringUtils.hasText(
                user.getRole()
        )

                && Role.PATIENT
                .equalsIgnoreCase(
                        user
                                .getRole()
                                .trim()
                );
    }


    /*
     * =========================================================
     * RESPONSE LIST
     * =========================================================
     */
    private List<EhrPatientLookupResponse> toResponses(
            List<User> users
    ) {

        List<EhrPatientLookupResponse> results =
                new ArrayList<>();


        if (users == null) {

            return results;
        }


        for (User user : users) {

            if (!isPatient(user)) {
                continue;
            }


            results.add(
                    toResponse(
                            user
                    )
            );
        }


        return results;
    }


    /*
     * =========================================================
     * USER -> RESPONSE
     * =========================================================
     */
    private EhrPatientLookupResponse toResponse(
            User patient
    ) {

        String fullName =
                getPatientName(
                        patient
                );


        String bloodGroup =
                StringUtils.hasText(
                        patient.getBloodGroup()
                )
                        ? patient
                        .getBloodGroup()
                        .trim()

                        : patient.getBloodType();


        return EhrPatientLookupResponse
                .builder()

                .id(
                        patient.getId()
                )

                .fullName(
                        StringUtils.hasText(
                                fullName
                        )
                                ? fullName
                                : "Patient"
                )

                .dateOfBirth(
                        patient.getDateOfBirth()
                )

                .gender(
                        patient.getGender()
                )

                .bloodGroup(
                        bloodGroup
                )

                .picture(
                        patient.getPicture()
                )

                .build();
    }


    /*
     * =========================================================
     * BUILD FALLBACK NAME
     * =========================================================
     */
    private String buildName(
            User patient
    ) {

        String firstName =
                StringUtils.hasText(
                        patient.getFirstName()
                )
                        ? patient
                        .getFirstName()
                        .trim()
                        : "";


        String lastName =
                StringUtils.hasText(
                        patient.getLastName()
                )
                        ? patient
                        .getLastName()
                        .trim()
                        : "";


        return (
                firstName
                        + " "
                        + lastName
        ).trim();
    }


    /*
     * =========================================================
     * NORMALIZE SEARCH TEXT
     * =========================================================
     */
    private String normalizeText(
            String value
    ) {

        if (value == null) {

            return "";
        }


        return value
                .trim()
                .toLowerCase(
                        Locale.ROOT
                )
                .replaceAll(
                        "\\s+",
                        " "
                );
    }


    /*
     * =========================================================
     * DOCTOR PATIENT SUMMARY
     * =========================================================
     */
    private static class DoctorPatientSummary {

        private int recordCount = 0;

        private LocalDate lastVisitDate;
    }
}