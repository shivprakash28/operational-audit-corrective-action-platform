package com.audit.platform.dto;

import com.audit.platform.entity.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class VerificationRequest {

    private Long correctiveActionId;

    @NotNull(message = "Verifier ID is required")
    private Long verifierId;

    private VerificationStatus status;

    private String comments;

    public VerificationRequest() {
    }

    public VerificationRequest(Long correctiveActionId, Long verifierId, VerificationStatus status, String comments) {
        this.correctiveActionId = correctiveActionId;
        this.verifierId = verifierId;
        this.status = status;
        this.comments = comments;
    }

    public Long getCorrectiveActionId() {
        return correctiveActionId;
    }

    public void setCorrectiveActionId(Long correctiveActionId) {
        this.correctiveActionId = correctiveActionId;
    }

    public Long getVerifierId() {
        return verifierId;
    }

    public void setVerifierId(Long verifierId) {
        this.verifierId = verifierId;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
