package lk.gamage.backend.healthbridgebackend.dto.request;

import lk.gamage.backend.healthbridgebackend.model.TicketStatus;

public class UpdateTicketStatusRequest {

    private TicketStatus status;

    public UpdateTicketStatusRequest() {
    }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
}