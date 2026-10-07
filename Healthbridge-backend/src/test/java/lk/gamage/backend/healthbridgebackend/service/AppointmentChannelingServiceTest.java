package lk.gamage.backend.healthbridgebackend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import lk.gamage.backend.healthbridgebackend.dto.request.AppointmentBookingRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.DoctorSessionRequest;
import lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus;
import lk.gamage.backend.healthbridgebackend.enums.SessionStatus;
import lk.gamage.backend.healthbridgebackend.exception.ConflictException;
import lk.gamage.backend.healthbridgebackend.model.Appointment;
import lk.gamage.backend.healthbridgebackend.model.DoctorSession;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.AppointmentRepository;
import lk.gamage.backend.healthbridgebackend.repository.DoctorSessionRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lk.gamage.backend.healthbridgebackend.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class AppointmentChannelingServiceTest {
    @Mock AppointmentRepository appointments;
    @Mock DoctorSessionRepository sessions;
    @Mock UserRepository users;
    @Mock MongoTemplate mongo;
    @Mock NotificationService notifications;
    DoctorSessionService sessionService;
    AppointmentServiceImpl service;

    @BeforeEach void setUp() {
        sessionService = spy(new DoctorSessionService(sessions, users, mongo, appointments, notifications));
        service = new AppointmentServiceImpl(appointments, users, sessionService, notifications);
    }

    @Test void successfulAppointment() {
        preparePatient(); DoctorSession s = session(1, 1, SessionStatus.AVAILABLE);
        doReturn(s).when(sessionService).reserve("s1"); when(users.findById("d1")).thenReturn(Optional.of(doctor()));
        when(appointments.save(any())).thenAnswer(inv -> { Appointment a=inv.getArgument(0); a.setId("a1"); return a; });
        var result = service.book("p1", request());
        assertEquals("a1", result.appointmentId()); assertEquals(AppointmentStatus.BOOKED, result.status());
    }

    @Test void firstAppointmentGetsNumberOne() {
        preparePatient(); doReturn(session(1,1,SessionStatus.AVAILABLE)).when(sessionService).reserve("s1");
        when(appointments.save(any())).thenAnswer(inv->inv.getArgument(0));
        assertEquals(1, service.book("p1", request()).appointmentNumber());
    }

    @Test void sequentialAppointmentNumbersComeFromAtomicSessionCounter() {
        User second = patient(); second.setId("p2"); when(users.findById(anyString())).thenReturn(Optional.of(patient()));
        doReturn(session(1,1,SessionStatus.AVAILABLE), session(2,2,SessionStatus.AVAILABLE)).when(sessionService).reserve("s1");
        when(appointments.save(any())).thenAnswer(inv->inv.getArgument(0));
        assertEquals(1, service.book("p1", request()).appointmentNumber());
        assertEquals(2, service.book("p2", request()).appointmentNumber());
    }

    @Test void fullSessionIsRejected() {
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(DoctorSession.class))).thenReturn(null);
        when(sessions.findById("s1")).thenReturn(Optional.of(session(2,2,SessionStatus.FULL)));
        assertThrows(ConflictException.class, () -> sessionService.reserve("s1"));
    }

    @Test void holidaySessionIsRejected() { assertUnavailable(SessionStatus.HOLIDAY, LocalDate.now().plusDays(1)); }
    @Test void cancelledSessionIsRejected() { assertUnavailable(SessionStatus.CANCELLED, LocalDate.now().plusDays(1)); }
    @Test void pastSessionIsRejected() { assertUnavailable(SessionStatus.AVAILABLE, LocalDate.now().minusDays(1)); }

    @Test void duplicatePatientBookingIsRejected() {
        preparePatient(); when(appointments.existsBySessionIdAndPatientIdAndStatusIn(eq("s1"),eq("p1"),anyList())).thenReturn(true);
        assertThrows(ConflictException.class,()->service.book("p1",request())); verify(sessionService,never()).reserve(anyString());
    }

    @Test void cancellationReleasesCapacity() {
        Appointment a=activeAppointment(); when(appointments.findById("a1")).thenReturn(Optional.of(a)); when(appointments.save(a)).thenReturn(a);
        doNothing().when(sessionService).release("s1");
        doReturn(session(0, 1, SessionStatus.AVAILABLE)).when(sessionService).require("s1");
        service.cancel("a1","p1","changed plans"); verify(sessionService).release("s1"); assertEquals(AppointmentStatus.CANCELLED,a.getStatus());
    }

    @Test void cancellationWithinTwentyFourHoursIsRejected() {
        Appointment a=activeAppointment();
        java.time.LocalDateTime soon=java.time.LocalDateTime.now().plusHours(2);
        a.setAppointmentDate(soon.toLocalDate());
        a.setAppointmentTime(soon.toLocalTime().withSecond(0).withNano(0).toString());
        when(appointments.findById("a1")).thenReturn(Optional.of(a));
        ConflictException error=assertThrows(ConflictException.class,()->service.cancel("a1","p1","changed plans"));
        assertTrue(error.getMessage().contains("at least 24 hours"));
        verify(appointments,never()).save(any());
        verify(sessionService,never()).release(anyString());
    }

    @Test void cancelledAppointmentsDoNotInflateTheNextActiveQueueNumber() {
        DoctorSession session = session(1, 1, SessionStatus.AVAILABLE);
        when(sessions.findById("s1")).thenReturn(Optional.of(session));
        sessionService.release("s1");

        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongo).updateFirst(query.capture(), update.capture(), eq(DoctorSession.class));

        org.bson.Document updateDoc = update.getValue().getUpdateObject();
        assertEquals(0, updateDoc.get("$set", org.bson.Document.class).getInteger("lastIssuedAppointmentNumber"));
    }

    @Test void unauthorizedPatientCannotViewAnotherPatientsAppointment() {
        when(appointments.findById("a1")).thenReturn(Optional.of(activeAppointment()));
        assertThrows(AccessDeniedException.class,()->service.findOwned("a1","other","PATIENT"));
    }

    @Test void doctorCannotManageAnotherDoctorsSession() {
        when(sessions.findById("s1")).thenReturn(Optional.of(session(0,0,SessionStatus.AVAILABLE)));
        assertThrows(AccessDeniedException.class,()->sessionService.owned("s1","other-doctor"));
    }

    @Test void doctorSessionUsesSelectedHospitalBranch() {
        when(users.findById("d1")).thenReturn(Optional.of(doctor()));
        when(sessions.findByDoctorIdAndSessionDate(eq("d1"), any())).thenReturn(List.of());
        when(sessions.save(any())).thenAnswer(inv -> { DoctorSession saved = inv.getArgument(0); saved.setId("s1"); return saved; });

        var result = sessionService.create("d1", sessionRequest("HOSP-004", "Asiri Central Hospital"));

        assertEquals("HOSP-004", result.hospitalId());
        assertEquals("Asiri Central Hospital", result.hospitalName());
    }

    @Test void sessionWithBookingsCannotMoveToAnotherHospitalBranch() {
        DoctorSession existing = session(1, 1, SessionStatus.AVAILABLE);
        when(sessions.findById("s1")).thenReturn(Optional.of(existing));

        assertThrows(ConflictException.class,
                () -> sessionService.update("d1", "s1", sessionRequest("HOSP-002", "St. Mary's Medical Center")));
    }

    @Test void concurrentBookingsCannotExceedCapacityBecauseFilterUsesMongoExpression() {
        when(mongo.findAndModify(any(Query.class),any(Update.class),any(FindAndModifyOptions.class),eq(DoctorSession.class))).thenReturn(session(1,1,SessionStatus.FULL));
        sessionService.reserve("s1");
        ArgumentCaptor<Query> query=ArgumentCaptor.forClass(Query.class); verify(mongo).findAndModify(query.capture(),any(Update.class),any(FindAndModifyOptions.class),eq(DoctorSession.class));
        assertTrue(query.getValue().getQueryObject().containsKey("$expr"));
    }

    @Test void concurrentBookingsAllocateNumberInSameAtomicUpdate() {
        when(mongo.findAndModify(any(Query.class),any(Update.class),any(FindAndModifyOptions.class),eq(DoctorSession.class))).thenReturn(session(1,1,SessionStatus.AVAILABLE));
        sessionService.reserve("s1");
        ArgumentCaptor<Update> update=ArgumentCaptor.forClass(Update.class); verify(mongo).findAndModify(any(Query.class),update.capture(),any(FindAndModifyOptions.class),eq(DoctorSession.class));
        org.bson.Document increments = update.getValue().getUpdateObject().get("$inc", org.bson.Document.class);
        assertEquals(1, increments.get("bookedCount")); assertEquals(1, increments.get("lastIssuedAppointmentNumber"));
    }

    private void assertUnavailable(SessionStatus status, LocalDate date) {
        DoctorSession s=session(0,0,status); s.setSessionDate(date);
        when(mongo.findAndModify(any(Query.class),any(Update.class),any(FindAndModifyOptions.class),eq(DoctorSession.class))).thenReturn(null);
        when(sessions.findById("s1")).thenReturn(Optional.of(s));
        assertThrows(ConflictException.class,()->sessionService.reserve("s1"));
    }
    private void preparePatient(){when(users.findById("p1")).thenReturn(Optional.of(patient()));}
    private AppointmentBookingRequest request(){return new AppointmentBookingRequest("s1","Patient One","0771234567","NIC12345","p@example.com","Colombo");}
    private User patient(){User u=new User();u.setId("p1");u.setRole("PATIENT");u.setFullName("Patient One");return u;}
    private User doctor(){User u=new User();u.setId("d1");u.setRole("DOCTOR");u.setFullName("Dr Test");return u;}
    private DoctorSession session(int booked,int issued,SessionStatus status){return DoctorSession.builder().id("s1").doctorId("d1").hospitalId("h1").hospitalName("HealthBridge").specializationName("Cardiology").sessionDate(LocalDate.now().plusDays(1)).startTime(LocalTime.of(9,0)).maxAppointments(2).bookedCount(booked).lastIssuedAppointmentNumber(issued).status(status).build();}
    private DoctorSessionRequest sessionRequest(String hospitalId, String hospitalName){return new DoctorSessionRequest(null,hospitalId,hospitalName,null,"Cardiology",LocalDate.now().plusDays(1),LocalTime.of(9,0),LocalTime.of(10,0),10,null);}
    private Appointment activeAppointment(){Appointment a=new Appointment();a.setId("a1");a.setSessionId("s1");a.setPatientId("p1");a.setDoctorId("d1");a.setStatus(AppointmentStatus.BOOKED);a.setAppointmentNumber(1);a.setAppointmentDate(LocalDate.now().plusDays(2));a.setAppointmentTime("09:00");return a;}
}
