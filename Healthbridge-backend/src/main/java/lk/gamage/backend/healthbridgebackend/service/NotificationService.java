package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.LabResult;
import lk.gamage.backend.healthbridgebackend.model.Notification;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.NotificationRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendCriticalResultAlert(LabResult saved) {
        // TODO: implement actual notification logic (email/SMS/push)
        System.out.println("CRITICAL ALERT: Result " + saved.getId() + " is critical for patient " + saved.getPatientId());
    }

    public void notifyResultAvailable(LabResult saved) {
        // TODO: implement actual notification logic
        System.out.println("Result published for patient " + saved.getPatientId());
    }

    public List<Notification> getNotifications(String recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    public long getUnreadCount(String recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    public Notification markAsRead(String notificationId, String recipientId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!recipientId.equals(notification.getRecipientId())) {
            throw new SecurityException("You are not allowed to update this notification");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void notifySupportTicket(String recipientId, String title, String message, String ticketId) {
        Notification notification = notificationRepository.save(Notification.builder()
                .recipientId(recipientId)
                .type("SUPPORT_TICKET")
                .title(title)
                .message(message)
                .referenceType("SUPPORT_TICKET")
                .referenceId(ticketId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build());
            messagingTemplate.convertAndSend("/topic/notifications/" + recipientId, notification);
    }

    public void notifyAppointment(String recipientId, String title, String message, String appointmentId) {
        notificationRepository.save(Notification.builder()
                .recipientId(recipientId)
                .type("APPOINTMENT")
                .title(title)
                .message(message)
                .referenceType("APPOINTMENT")
                .referenceId(appointmentId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public void notifyAdminsAboutTicket(String title, String message, String ticketId) {
        List<User> admins = userRepository.findByRoleIn(List.of(Role.ADMIN, Role.SUPER_ADMIN));
        admins.forEach(admin -> notifySupportTicket(admin.getId(), title, message, ticketId));
    }
}
