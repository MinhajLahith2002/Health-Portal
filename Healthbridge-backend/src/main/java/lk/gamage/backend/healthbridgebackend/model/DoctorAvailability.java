package lk.gamage.backend.healthbridgebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "doctor_availability")
public class DoctorAvailability {
	@Id private String id;
	private String doctorId;
	private String date;
	private String startTime;
	private String endTime;
	private String status;

	public DoctorAvailability() { }
	public DoctorAvailability(String id, String doctorId, String date, String startTime, String endTime, String status) {
		this.id = id; this.doctorId = doctorId; this.date = date; this.startTime = startTime; this.endTime = endTime; this.status = status;
	}
	public String getId() { return id; } public void setId(String v) { id = v; }
	public String getDoctorId() { return doctorId; } public void setDoctorId(String v) { doctorId = v; }
	public String getDate() { return date; } public void setDate(String v) { date = v; }
	public String getStartTime() { return startTime; } public void setStartTime(String v) { startTime = v; }
	public String getEndTime() { return endTime; } public void setEndTime(String v) { endTime = v; }
	public String getStatus() { return status; } public void setStatus(String v) { status = v; }
}
