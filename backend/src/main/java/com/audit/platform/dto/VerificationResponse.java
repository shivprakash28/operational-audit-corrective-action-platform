package com.audit.platform.dto;

import com.audit.platform.entity.CorrectiveActionStatus;
import com.audit.platform.entity.Verification;
import com.audit.platform.entity.VerificationStatus;

import java.time.LocalDateTime;

public class VerificationResponse {

    private Long id;
    private Long correctiveActionId;
    private String correctiveActionTitle;
    private CorrectiveActionStatus correctiveActionStatus;
    private Long verifierId;
    private String verifierName;
    private String verifierEmail;
    private VerificationStatus status;
    private String comments;
    private LocalDateTime verifiedAt;

    public VerificationResponse() {
    }

    public static VerificationResponse fromEntity(Verification verification) {
        VerificationResponse response = new VerificationResponse();
        response.setId(verification.getId());
        if (verification.getCorrectiveAction() != null) {
            response.setCorrectiveActionId(verification.getCorrectiveAction().getId());
            response.setCorrectiveActionTitle(verification.getCorrectiveAction().getTitle());
            response.setCorrectiveActionStatus(verification.getCorrectiveAction().getStatus());
        }
        if (verification.getVerifier() != null) {
            response.setVerifierId(verification.getVerifier().getId());
            response.setVerifierName(verification.getVerifier().getName());
            response.setVerifierEmail(verification.getVerifier().getEmail());
        }
        response.setStatus(verification.getStatus());
        response.setComments(verification.getComments());
        response.setVerifiedAt(verification.getVerifiedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCorrectiveActionId() {
        return correctiveActionId;
    }

    public void setCorrectiveActionId(Long correctiveActionId) {
        this.correctiveActionId = correctiveActionId;
    }

    public String getCorrectiveActionTitle() {
        return correctiveActionTitle;
    }

    public void setCorrectiveActionTitle(String correctiveActionTitle) {
        this.correctiveActionTitle = correctiveActionTitle;
    }

    public CorrectiveActionStatus getCorrectiveActionStatus() {
        return correctiveActionStatus;
    }

    public void setCorrectiveActionStatus(CorrectiveActionStatus correctiveActionStatus) {
        this.correctiveActionStatus = correctiveActionStatus;
    }

    public Long getVerifierId() {
        return verifierId;
    }

    public void setVerifierId(Long verifierId) {
        this.verifierId = verifierId;
    }

    public String getVerifierName() {
        return verifierName;
    }

    public void setVerifierName(String verifierName) {
        this.verifierName = verifierName;
    }

    public String getVerifierEmail() {
        return verifierEmail;
    }

    public void setVerifierEmail(String verifierEmail) {
        this.verifierEmail = verifierEmail;
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

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
