package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.Notification;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lk.gamage.backend.healthbridgebackend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private UserRepository userRepository;

	@GetMapping
	public ResponseEntity<List<Notification>> getNotifications() {
		return ResponseEntity.ok(notificationService.getNotifications(getCurrentUser().getId()));
	}

	@GetMapping("/unread-count")
	public ResponseEntity<Map<String, Long>> getUnreadCount() {
		return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(getCurrentUser().getId())));
	}

	@PatchMapping("/{id}/read")
	public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
		return ResponseEntity.ok(notificationService.markAsRead(id, getCurrentUser().getId()));
	}

	private User getCurrentUser() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		return userRepository.findByEmail(email.toLowerCase().trim())
				.orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
	}
}
