package com.audit.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ObservationRequest {

    private Long auditId;

    @NotNull(message = "Checklist item ID is required")
    private Long checklistItemId;

    @NotBlank(message = "Description is required")
    private String description;

    private String evidenceUrl;

    @NotNull(message = "Created by user ID is required")
    private Long createdById;

    public ObservationRequest() {
    }

    public ObservationRequest(Long auditId, Long checklistItemId, String description,
                              String evidenceUrl, Long createdById) {
        this.auditId = auditId;
        this.checklistItemId = checklistItemId;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
        this.createdById = createdById;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public Long getChecklistItemId() {
        return checklistItemId;
    }

    public void setChecklistItemId(Long checklistItemId) {
        this.checklistItemId = checklistItemId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
}
