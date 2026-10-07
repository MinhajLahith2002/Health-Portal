package lk.gamage.backend.healthbridgebackend.service;

import com.itextpdf.text.Anchor;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import lk.gamage.backend.healthbridgebackend.dto.response.DiagnosisResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalDocumentResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalRecordResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.PatientEhrHistoryResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.TreatmentRecordResponse;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;


@Service
public class MedicalRecordPdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private static final BaseColor PRIMARY =
            new BaseColor(13, 148, 136);

    private static final BaseColor LIGHT_PRIMARY =
            new BaseColor(240, 253, 250);

    private static final BaseColor LIGHT_GRAY =
            new BaseColor(248, 250, 252);

    private static final BaseColor BORDER =
            new BaseColor(226, 232, 240);


    private final PatientEhrHistoryService patientEhrHistoryService;
    private final MedicalRecordService medicalRecordService;
    private final UserRepository userRepository;


    public MedicalRecordPdfService(
            PatientEhrHistoryService patientEhrHistoryService,
            MedicalRecordService medicalRecordService,
            UserRepository userRepository
    ) {
        this.patientEhrHistoryService =
                patientEhrHistoryService;

        this.medicalRecordService =
                medicalRecordService;

        this.userRepository =
                userRepository;
    }


    /*
     * =========================================================
     * DOCTOR PDF ACCESS
     * =========================================================
     *
     * Doctor can download a patient's report only when that
     * doctor has created at least one active MedicalRecord
     * for that patient.
     */
    public boolean canDoctorDownloadPatientPdf(
            String doctorId,
            String patientId
    ) {

        if (!StringUtils.hasText(doctorId)
                || !StringUtils.hasText(patientId)) {

            return false;
        }


        String normalizedDoctorId =
                doctorId.trim();

        String normalizedPatientId =
                patientId.trim();


        return medicalRecordService
                .getMedicalRecordsByDoctorId(
                        normalizedDoctorId
                )
                .stream()
                .anyMatch(
                        record ->
                                normalizedPatientId.equals(
                                        record.getPatientId()
                                )
                );
    }


    /*
     * =========================================================
     * GENERATE PDF
     * =========================================================
     */
    public byte[] generatePatientMedicalRecordPdf(
            String patientId,
            String requestedByUserId
    ) {

        if (!StringUtils.hasText(patientId)) {
            throw new IllegalArgumentException(
                    "Patient ID is required"
            );
        }


        String normalizedPatientId =
                patientId.trim();


        /*
         * Get patient profile.
         */
        User patient =
                userRepository
                        .findById(
                                normalizedPatientId
                        )
                        .filter(
                                user ->
                                        Role.PATIENT.equals(
                                                user.getRole()
                                        )
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Patient not found"
                                        )
                        );


        /*
         * Get full active EHR history.
         */
        PatientEhrHistoryResponse history =
                patientEhrHistoryService
                        .getPatientEhrHistory(
                                normalizedPatientId
                        );


        /*
         * User who requested the PDF.
         *
         * Can be Doctor or Patient.
         */
        User requestedBy = null;


        if (StringUtils.hasText(
                requestedByUserId
        )) {

            requestedBy =
                    userRepository
                            .findById(
                                    requestedByUserId.trim()
                            )
                            .orElse(null);
        }


        try (
                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {

            Document document =
                    new Document(
                            PageSize.A4,
                            36,
                            36,
                            42,
                            42
                    );


            PdfWriter.getInstance(
                    document,
                    outputStream
            );


            document.open();


            addHeader(document);

            addPatientDetails(
                    document,
                    patient
            );

            addRequestedByDetails(
                    document,
                    requestedBy
            );

            addSummary(
                    document,
                    history
            );

            addMedicalRecords(
                    document,
                    history
            );

            addFooter(document);


            document.close();


            return outputStream
                    .toByteArray();


        } catch (DocumentException exception) {

            throw new IllegalStateException(
                    "Failed to generate medical record PDF",
                    exception
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to generate medical record PDF",
                    exception
            );
        }
    }


    /*
     * =========================================================
     * HEADER
     * =========================================================
     */
    private void addHeader(
            Document document
    ) throws DocumentException {

        Font brandFont =
                new Font(
                        Font.FontFamily.HELVETICA,
                        11,
                        Font.BOLD,
                        PRIMARY
                );


        Font titleFont =
                new Font(
                        Font.FontFamily.HELVETICA,
                        22,
                        Font.BOLD,
                        new BaseColor(
                                15,
                                23,
                                42
                        )
                );


        Font subTitleFont =
                new Font(
                        Font.FontFamily.HELVETICA,
                        10,
                        Font.NORMAL,
                        new BaseColor(
                                100,
                                116,
                                139
                        )
                );


        Paragraph brand =
                new Paragraph(
                        "HEALTHBRIDGE",
                        brandFont
                );

        brand.setAlignment(
                Element.ALIGN_CENTER
        );


        document.add(
                brand
        );


        Paragraph title =
                new Paragraph(
                        "Detailed Medical Record Report",
                        titleFont
                );

        title.setAlignment(
                Element.ALIGN_CENTER
        );

        title.setSpacingBefore(
                4
        );


        document.add(
                title
        );


        Paragraph generated =
                new Paragraph(
                        "Generated on "
                                + LocalDateTime
                                .now()
                                .format(
                                        DATE_TIME_FORMAT
                                ),
                        subTitleFont
                );


        generated.setAlignment(
                Element.ALIGN_CENTER
        );

        generated.setSpacingBefore(
                5
        );

        generated.setSpacingAfter(
                18
        );


        document.add(
                generated
        );
    }


    /*
     * =========================================================
     * PATIENT DETAILS
     * =========================================================
     */
    private void addPatientDetails(
            Document document,
            User patient
    ) throws DocumentException {

        addSectionTitle(
                document,
                "Patient Details"
        );


        PdfPTable table =
                createInfoTable();


        addInfoRow(
                table,
                "Patient ID",
                patient.getId()
        );


        addInfoRow(
                table,
                "Full Name",
                buildFullName(
                        patient
                )
        );


        addInfoRow(
                table,
                "Email",
                patient.getEmail()
        );


        addInfoRow(
                table,
                "Phone",
                firstNonBlank(
                        patient.getPhoneNumber(),
                        patient.getPhone()
                )
        );


        addInfoRow(
                table,
                "Date of Birth",
                patient.getDateOfBirth()
        );


        addInfoRow(
                table,
                "Gender",
                patient.getGender()
        );


        addInfoRow(
                table,
                "Blood Group",
                firstNonBlank(
                        patient.getBloodGroup(),
                        patient.getBloodType()
                )
        );


        addInfoRow(
                table,
                "Address",
                patient.getAddress()
        );


        /*
         * NEW Branch section.
         */
        addInfoRow(
                table,
                "Registered Branch",
                patient.getBranch()
        );


        addInfoRow(
                table,
                "Emergency Contact",
                patient.getEmergencyContact()
        );


        document.add(
                table
        );
    }


    /*
     * =========================================================
     * REPORT REQUESTED BY
     * =========================================================
     */
    private void addRequestedByDetails(
            Document document,
            User requestedBy
    ) throws DocumentException {

        if (requestedBy == null) {
            return;
        }


        addSectionTitle(
                document,
                "Report Requested By"
        );


        PdfPTable table =
                createInfoTable();


        addInfoRow(
                table,
                "Name",
                buildFullName(
                        requestedBy
                )
        );


        addInfoRow(
                table,
                "Role",
                requestedBy.getRole()
        );


        addInfoRow(
                table,
                "Email",
                requestedBy.getEmail()
        );


        addInfoRow(
                table,
                "Phone",
                firstNonBlank(
                        requestedBy.getPhoneNumber(),
                        requestedBy.getPhone()
                )
        );


        addInfoRow(
                table,
                "Branch",
                requestedBy.getBranch()
        );


        document.add(
                table
        );
    }


    /*
     * =========================================================
     * SUMMARY
     * =========================================================
     */
    private void addSummary(
            Document document,
            PatientEhrHistoryResponse history
    ) throws DocumentException {

        addSectionTitle(
                document,
                "Medical Record Summary"
        );


        PdfPTable table =
                new PdfPTable(
                        4
                );


        table.setWidthPercentage(
                100
        );

        table.setSpacingAfter(
                12
        );


        addSummaryCell(
                table,
                "Medical Records",
                sizeOf(
                        history.getMedicalRecords()
                )
        );


        addSummaryCell(
                table,
                "Diagnoses",
                sizeOf(
                        history.getDiagnoses()
                )
        );


        addSummaryCell(
                table,
                "Treatments",
                sizeOf(
                        history.getTreatments()
                )
        );


        addSummaryCell(
                table,
                "Documents",
                sizeOf(
                        history.getDocuments()
                )
        );


        document.add(
                table
        );
    }


    /*
     * =========================================================
     * MEDICAL RECORDS
     * =========================================================
     */
    private void addMedicalRecords(
            Document document,
            PatientEhrHistoryResponse history
    ) throws DocumentException {

        List<MedicalRecordResponse> records =
                safeList(
                        history.getMedicalRecords()
                );


        if (records.isEmpty()) {

            addSectionTitle(
                    document,
                    "Medical Records"
            );


            document.add(
                    new Paragraph(
                            "No active medical records are available for this patient.",
                            normalFont()
                    )
            );


            return;
        }


        int recordNumber =
                1;


        for (
                MedicalRecordResponse record :
                records
        ) {

            addRecordBlock(
                    document,
                    record,
                    recordNumber,
                    history
            );


            recordNumber++;
        }
    }


    /*
     * =========================================================
     * SINGLE MEDICAL RECORD
     * =========================================================
     */
    private void addRecordBlock(
            Document document,
            MedicalRecordResponse record,
            int recordNumber,
            PatientEhrHistoryResponse history
    ) throws DocumentException {

        Paragraph heading =
                new Paragraph(
                        "Medical Record "
                                + recordNumber,
                        new Font(
                                Font.FontFamily.HELVETICA,
                                14,
                                Font.BOLD,
                                new BaseColor(
                                        15,
                                        23,
                                        42
                                )
                        )
                );


        heading.setSpacingBefore(
                10
        );

        heading.setSpacingAfter(
                8
        );


        document.add(
                heading
        );


        /*
         * Load doctor account.
         *
         * This gives us latest doctor:
         * - email
         * - phone
         * - branch
         */
        User recordDoctor =
                null;


        if (StringUtils.hasText(
                record.getDoctorId()
        )) {

            recordDoctor =
                    userRepository
                            .findById(
                                    record
                                            .getDoctorId()
                                            .trim()
                            )
                            .orElse(null);
        }


        PdfPTable basicTable =
                createInfoTable();


        addInfoRow(
                basicTable,
                "Record ID",
                record.getId()
        );


        addInfoRow(
                basicTable,
                "Visit Date",
                formatDate(
                        record.getVisitDate()
                )
        );


        addInfoRow(
                basicTable,
                "Record Type",
                record.getRecordType()
        );


        addInfoRow(
                basicTable,
                "Status",
                record.getStatus()
        );


        addInfoRow(
                basicTable,
                "Version",
                String.valueOf(
                        record.getVersion()
                )
        );


        addInfoRow(
                basicTable,
                "Hospital / Clinic",
                record.getHospitalName()
        );


        addInfoRow(
                basicTable,
                "Doctor",
                record.getDoctorName()
        );


        addInfoRow(
                basicTable,
                "Doctor Email",
                recordDoctor != null
                        ? recordDoctor.getEmail()
                        : null
        );


        addInfoRow(
                basicTable,
                "Doctor Phone",
                recordDoctor != null
                        ? firstNonBlank(
                                recordDoctor.getPhoneNumber(),
                                recordDoctor.getPhone()
                        )
                        : null
        );


        /*
         * Relevant doctor branch.
         */
        addInfoRow(
                basicTable,
                "Doctor Branch",
                recordDoctor != null
                        ? recordDoctor.getBranch()
                        : null
        );


        addInfoRow(
                basicTable,
                "Created At",
                formatDateTime(
                        record.getCreatedAt()
                )
        );


        addInfoRow(
                basicTable,
                "Last Updated",
                formatDateTime(
                        record.getUpdatedAt()
                )
        );


        document.add(
                basicTable
        );


        /*
         * Main Medical Record details.
         */
        addTextSection(
                document,
                "Primary Diagnosis",
                record.getDiagnosis()
        );


        addTextSection(
                document,
                "Clinical Summary",
                record.getClinicalSummary()
        );


        addBulletSection(
                document,
                "Symptoms",
                record.getSymptoms()
        );


        addBulletSection(
                document,
                "Treatment Plan",
                record.getTreatmentPlan()
        );


        addTextSection(
                document,
                "Consultation Notes",
                record.getConsultationNotes()
        );


        /*
         * Diagnoses belonging to this MedicalRecord.
         */
        List<DiagnosisResponse> diagnoses =
                safeList(
                        history.getDiagnoses()
                )
                        .stream()
                        .filter(
                                item ->
                                        Objects.equals(
                                                record.getId(),
                                                item.getMedicalRecordId()
                                        )
                        )
                        .toList();


        addDiagnoses(
                document,
                diagnoses
        );


        /*
         * Treatments belonging to this MedicalRecord.
         */
        List<TreatmentRecordResponse> treatments =
                safeList(
                        history.getTreatments()
                )
                        .stream()
                        .filter(
                                item ->
                                        Objects.equals(
                                                record.getId(),
                                                item.getMedicalRecordId()
                                        )
                        )
                        .toList();


        addTreatments(
                document,
                treatments
        );


        /*
         * Documents belonging to this MedicalRecord.
         */
        List<MedicalDocumentResponse> documents =
                safeList(
                        history.getDocuments()
                )
                        .stream()
                        .filter(
                                item ->
                                        Objects.equals(
                                                record.getId(),
                                                item.getMedicalRecordId()
                                        )
                        )
                        .toList();


        addDocuments(
                document,
                documents
        );
    }


    /*
     * =========================================================
     * DIAGNOSES
     * =========================================================
     */
    private void addDiagnoses(
            Document document,
            List<DiagnosisResponse> diagnoses
    ) throws DocumentException {

        addSubSectionTitle(
                document,
                "Detailed Diagnoses"
        );


        if (diagnoses.isEmpty()) {

            addMutedText(
                    document,
                    "No additional diagnoses recorded."
            );

            return;
        }


        for (
                DiagnosisResponse diagnosis :
                diagnoses
        ) {

            PdfPTable table =
                    createInfoTable();


            addInfoRow(
                    table,
                    "Diagnosis",
                    diagnosis.getDiagnosisName()
            );


            addInfoRow(
                    table,
                    "Description",
                    diagnosis.getDescription()
            );


            addInfoRow(
                    table,
                    "Severity",
                    diagnosis.getSeverity()
            );


            addInfoRow(
                    table,
                    "Diagnosed Date",
                    formatDate(
                            diagnosis.getDiagnosedDate()
                    )
            );


            document.add(
                    table
            );
        }
    }


    /*
     * =========================================================
     * TREATMENTS
     * =========================================================
     */
    private void addTreatments(
            Document document,
            List<TreatmentRecordResponse> treatments
    ) throws DocumentException {

        addSubSectionTitle(
                document,
                "Treatment Records"
        );


        if (treatments.isEmpty()) {

            addMutedText(
                    document,
                    "No detailed treatment records recorded."
            );

            return;
        }


        for (
                TreatmentRecordResponse treatment :
                treatments
        ) {

            PdfPTable table =
                    createInfoTable();


            addInfoRow(
                    table,
                    "Treatment Type",
                    treatment.getTreatmentType()
            );


            addInfoRow(
                    table,
                    "Description",
                    treatment.getDescription()
            );


            addInfoRow(
                    table,
                    "Start Date",
                    formatDate(
                            treatment.getStartDate()
                    )
            );


            addInfoRow(
                    table,
                    "End Date",
                    formatDate(
                            treatment.getEndDate()
                    )
            );


            addInfoRow(
                    table,
                    "Status",
                    treatment.getStatus()
            );


            document.add(
                    table
            );
        }
    }


    /*
     * =========================================================
     * MEDICAL DOCUMENTS
     * =========================================================
     */
    private void addDocuments(
            Document document,
            List<MedicalDocumentResponse> documents
    ) throws DocumentException {

        addSubSectionTitle(
                document,
                "Clinical Documents"
        );


        if (documents.isEmpty()) {

            addMutedText(
                    document,
                    "No active clinical documents attached."
            );

            return;
        }


        for (
                MedicalDocumentResponse medicalDocument :
                documents
        ) {

            PdfPTable table =
                    createInfoTable();


            addInfoRow(
                    table,
                    "Document Type",
                    medicalDocument.getDocumentType()
            );


            addInfoRow(
                    table,
                    "File Name",
                    medicalDocument.getFileName()
            );


            addInfoRow(
                    table,
                    "Status",
                    medicalDocument.getStatus()
            );


            addInfoRow(
                    table,
                    "Version",
                    medicalDocument.getVersion() != null
                            ? String.valueOf(
                                    medicalDocument.getVersion()
                            )
                            : null
            );


            addInfoRow(
                    table,
                    "File Size",
                    formatFileSize(
                            medicalDocument.getFileSize()
                    )
            );


            addInfoRow(
                    table,
                    "Description",
                    medicalDocument.getDescription()
            );


            addInfoRow(
                    table,
                    "Uploaded At",
                    formatDateTime(
                            medicalDocument.getUploadedAt()
                    )
            );


            document.add(
                    table
            );


            /*
             * Clickable link inside generated PDF.
             */
            if (StringUtils.hasText(
                    medicalDocument.getFileUrl()
            )) {

                Anchor link =
                        new Anchor(
                                "Open attached document",
                                new Font(
                                        Font.FontFamily.HELVETICA,
                                        9,
                                        Font.UNDERLINE,
                                        PRIMARY
                                )
                        );


                link.setReference(
                        medicalDocument.getFileUrl()
                );


                Paragraph linkParagraph =
                        new Paragraph();


                linkParagraph.add(
                        link
                );


                linkParagraph.setSpacingAfter(
                        8
                );


                document.add(
                        linkParagraph
                );
            }
        }
    }


    /*
     * =========================================================
     * FOOTER
     * =========================================================
     */
    private void addFooter(
            Document document
    ) throws DocumentException {

        Paragraph spacing =
                new Paragraph(
                        " "
                );


        spacing.setSpacingBefore(
                8
        );


        document.add(
                spacing
        );


        Paragraph footer =
                new Paragraph(
                        "This report was generated from the HealthBridge "
                                + "Electronic Health Record system. "
                                + "It contains active medical-record information "
                                + "available at the time of download.",
                        new Font(
                                Font.FontFamily.HELVETICA,
                                8,
                                Font.ITALIC,
                                new BaseColor(
                                        100,
                                        116,
                                        139
                                )
                        )
                );


        footer.setAlignment(
                Element.ALIGN_CENTER
        );


        document.add(
                footer
        );
    }


    /*
     * =========================================================
     * PDF HELPERS
     * =========================================================
     */
    private void addSectionTitle(
            Document document,
            String title
    ) throws DocumentException {

        Paragraph paragraph =
                new Paragraph(
                        title,
                        new Font(
                                Font.FontFamily.HELVETICA,
                                13,
                                Font.BOLD,
                                PRIMARY
                        )
                );


        paragraph.setSpacingBefore(
                10
        );

        paragraph.setSpacingAfter(
                7
        );


        document.add(
                paragraph
        );
    }


    private void addSubSectionTitle(
            Document document,
            String title
    ) throws DocumentException {

        Paragraph paragraph =
                new Paragraph(
                        title,
                        new Font(
                                Font.FontFamily.HELVETICA,
                                11,
                                Font.BOLD,
                                new BaseColor(
                                        30,
                                        41,
                                        59
                                )
                        )
                );


        paragraph.setSpacingBefore(
                8
        );

        paragraph.setSpacingAfter(
                5
        );


        document.add(
                paragraph
        );
    }


    private void addTextSection(
            Document document,
            String title,
            String value
    ) throws DocumentException {

        addSubSectionTitle(
                document,
                title
        );


        document.add(
                new Paragraph(
                        display(
                                value
                        ),
                        normalFont()
                )
        );
    }


    private void addBulletSection(
            Document document,
            String title,
            List<String> items
    ) throws DocumentException {

        addSubSectionTitle(
                document,
                title
        );


        List<String> safeItems =
                safeList(
                        items
                )
                        .stream()
                        .filter(
                                StringUtils::hasText
                        )
                        .toList();


        if (safeItems.isEmpty()) {

            addMutedText(
                    document,
                    "N/A"
            );

            return;
        }


        com.itextpdf.text.List pdfList =
                new com.itextpdf.text.List(
                        com.itextpdf.text.List.UNORDERED
                );


        pdfList.setIndentationLeft(
                14
        );


        for (
                String item :
                safeItems
        ) {

            pdfList.add(
                    new com.itextpdf.text.ListItem(
                            item.trim(),
                            normalFont()
                    )
            );
        }


        document.add(
                pdfList
        );
    }


    private PdfPTable createInfoTable()
            throws DocumentException {

        PdfPTable table =
                new PdfPTable(
                        2
                );


        table.setWidthPercentage(
                100
        );


        table.setWidths(
                new float[]{
                        1.25f,
                        2.75f
                }
        );


        table.setSpacingAfter(
                10
        );


        return table;
    }


    private void addInfoRow(
            PdfPTable table,
            String label,
            String value
    ) {

        PdfPCell labelCell =
                new PdfPCell(
                        new Phrase(
                                label,
                                new Font(
                                        Font.FontFamily.HELVETICA,
                                        9,
                                        Font.BOLD,
                                        new BaseColor(
                                                71,
                                                85,
                                                105
                                        )
                                )
                        )
                );


        labelCell.setBackgroundColor(
                LIGHT_GRAY
        );


        styleCell(
                labelCell
        );


        PdfPCell valueCell =
                new PdfPCell(
                        new Phrase(
                                display(
                                        value
                                ),
                                normalFont()
                        )
                );


        styleCell(
                valueCell
        );


        table.addCell(
                labelCell
        );


        table.addCell(
                valueCell
        );
    }


    private void addSummaryCell(
            PdfPTable table,
            String label,
            int count
    ) {

        Paragraph value =
                new Paragraph(
                        String.valueOf(
                                count
                        ),
                        new Font(
                                Font.FontFamily.HELVETICA,
                                15,
                                Font.BOLD,
                                PRIMARY
                        )
                );


        value.setAlignment(
                Element.ALIGN_CENTER
        );


        Paragraph caption =
                new Paragraph(
                        label,
                        new Font(
                                Font.FontFamily.HELVETICA,
                                8,
                                Font.NORMAL,
                                new BaseColor(
                                        71,
                                        85,
                                        105
                                )
                        )
                );


        caption.setAlignment(
                Element.ALIGN_CENTER
        );


        PdfPCell cell =
                new PdfPCell();


        cell.addElement(
                value
        );


        cell.addElement(
                caption
        );


        cell.setBackgroundColor(
                LIGHT_PRIMARY
        );


        cell.setPadding(
                8
        );


        cell.setBorderColor(
                BORDER
        );


        table.addCell(
                cell
        );
    }


    private void styleCell(
            PdfPCell cell
    ) {

        cell.setPadding(
                6
        );


        cell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );


        cell.setBorderColor(
                BORDER
        );
    }


    private void addMutedText(
            Document document,
            String value
    ) throws DocumentException {

        document.add(
                new Paragraph(
                        value,
                        new Font(
                                Font.FontFamily.HELVETICA,
                                9,
                                Font.ITALIC,
                                new BaseColor(
                                        100,
                                        116,
                                        139
                                )
                        )
                )
        );
    }


    private Font normalFont() {

        return FontFactory.getFont(
                FontFactory.HELVETICA,
                9,
                BaseColor.DARK_GRAY
        );
    }


    /*
     * =========================================================
     * DATA HELPERS
     * =========================================================
     */
    private String buildFullName(
            User user
    ) {

        if (user == null) {
            return "N/A";
        }


        if (StringUtils.hasText(
                user.getFullName()
        )) {

            return user
                    .getFullName()
                    .trim();
        }


        String firstName =
                displayEmpty(
                        user.getFirstName()
                );


        String lastName =
                displayEmpty(
                        user.getLastName()
                );


        String combined =
                (
                        firstName
                                + " "
                                + lastName
                )
                        .trim();


        return StringUtils.hasText(
                combined
        )
                ? combined
                : display(
                        user.getEmail()
                );
    }


    private String firstNonBlank(
            String first,
            String second
    ) {

        if (StringUtils.hasText(
                first
        )) {

            return first.trim();
        }


        if (StringUtils.hasText(
                second
        )) {

            return second.trim();
        }


        return null;
    }


    private String display(
            String value
    ) {

        return StringUtils.hasText(
                value
        )
                ? value.trim()
                : "N/A";
    }


    private String displayEmpty(
            String value
    ) {

        return StringUtils.hasText(
                value
        )
                ? value.trim()
                : "";
    }


    private String formatDate(
            LocalDate value
    ) {

        return value != null
                ? value.format(
                        DATE_FORMAT
                )
                : "N/A";
    }


    private String formatDateTime(
            LocalDateTime value
    ) {

        return value != null
                ? value.format(
                        DATE_TIME_FORMAT
                )
                : "N/A";
    }


    private String formatFileSize(
            long bytes
    ) {

        if (bytes <= 0) {
            return "0 KB";
        }


        double kb =
                bytes / 1024.0;


        if (kb < 1024) {

            return String.format(
                    "%.1f KB",
                    kb
            );
        }


        return String.format(
                "%.1f MB",
                kb / 1024.0
        );
    }


    private int sizeOf(
            List<?> values
    ) {

        return values == null
                ? 0
                : values.size();
    }


    private <T> List<T> safeList(
            List<T> values
    ) {

        return values == null
                ? List.of()
                : values;
    }
}