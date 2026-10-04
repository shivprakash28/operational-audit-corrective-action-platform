package com.audit.platform.dto;

import com.audit.platform.entity.FindingSeverity;
import com.audit.platform.entity.FindingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class FindingRequest {

    private Long auditId;

    @NotNull(message = "Observation ID is required")
    private Long observationId;

    @NotNull(message = "Severity is required")
    private FindingSeverity severity;

    @NotNull(message = "Responsible department ID is required")
    private Long responsibleDepartmentId;

    private Long ownerId;

    private FindingStatus status;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    public FindingRequest() {
    }

    public FindingRequest(Long auditId, Long observationId, FindingSeverity severity,
                          Long responsibleDepartmentId, Long ownerId, FindingStatus status,
                          String description) {
        this.auditId = auditId;
        this.observationId = observationId;
        this.severity = severity;
        this.responsibleDepartmentId = responsibleDepartmentId;
        this.ownerId = ownerId;
        this.status = status;
        this.description = description;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public Long getObservationId() {
        return observationId;
    }

    public void setObservationId(Long observationId) {
        this.observationId = observationId;
    }

    public FindingSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(FindingSeverity severity) {
        this.severity = severity;
    }

    public Long getResponsibleDepartmentId() {
        return responsibleDepartmentId;
    }

    public void setResponsibleDepartmentId(Long responsibleDepartmentId) {
        this.responsibleDepartmentId = responsibleDepartmentId;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public FindingStatus getStatus() {
        return status;
    }

    public void setStatus(FindingStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
