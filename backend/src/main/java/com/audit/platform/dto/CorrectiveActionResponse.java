package com.audit.platform.dto;

import com.audit.platform.entity.CorrectiveAction;
import com.audit.platform.entity.CorrectiveActionStatus;

import java.time.LocalDateTime;

public class CorrectiveActionResponse {

    private Long id;
    private Long findingId;
    private String findingDescription;
    private Long auditId;
    private String title;
    private String description;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime dueDate;
    private LocalDateTime deadline;
    private CorrectiveActionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CorrectiveActionResponse() {
    }

    public static CorrectiveActionResponse fromEntity(CorrectiveAction correctiveAction) {
        CorrectiveActionResponse response = new CorrectiveActionResponse();
        response.setId(correctiveAction.getId());
        if (correctiveAction.getFinding() != null) {
            response.setFindingId(correctiveAction.getFinding().getId());
            response.setFindingDescription(correctiveAction.getFinding().getDescription());
            if (correctiveAction.getFinding().getAudit() != null) {
                response.setAuditId(correctiveAction.getFinding().getAudit().getId());
            }
        }
        response.setTitle(correctiveAction.getTitle());
        response.setDescription(correctiveAction.getDescription());
        if (correctiveAction.getOwner() != null) {
            response.setOwnerId(correctiveAction.getOwner().getId());
            response.setOwnerName(correctiveAction.getOwner().getName());
            response.setOwnerEmail(correctiveAction.getOwner().getEmail());
        }
        response.setDueDate(correctiveAction.getDueDate());
        response.setDeadline(correctiveAction.getDueDate());
        response.setStatus(correctiveAction.getStatus());
        response.setCreatedAt(correctiveAction.getCreatedAt());
        response.setUpdatedAt(correctiveAction.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public String getFindingDescription() {
        return findingDescription;
    }

    public void setFindingDescription(String findingDescription) {
        this.findingDescription = findingDescription;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public CorrectiveActionStatus getStatus() {
        return status;
    }

    public void setStatus(CorrectiveActionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
