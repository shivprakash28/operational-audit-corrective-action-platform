package com.audit.platform.dto;

import com.audit.platform.entity.FindingSeverity;
import com.audit.platform.entity.FindingStatus;

import java.time.LocalDateTime;

public class FindingResponse {

    private Long id;
    private Long auditId;
    private String auditTitle;
    private Long observationId;
    private String observationDescription;
    private FindingSeverity severity;
    private Long responsibleDepartmentId;
    private String responsibleDepartmentName;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private FindingStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FindingResponse() {
    }

    public FindingResponse(Long id, Long auditId, String auditTitle, Long observationId,
                           String observationDescription, FindingSeverity severity,
                           Long responsibleDepartmentId, String responsibleDepartmentName,
                           Long ownerId, String ownerName, String ownerEmail,
                           FindingStatus status, String description,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.auditId = auditId;
        this.auditTitle = auditTitle;
        this.observationId = observationId;
        this.observationDescription = observationDescription;
        this.severity = severity;
        this.responsibleDepartmentId = responsibleDepartmentId;
        this.responsibleDepartmentName = responsibleDepartmentName;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.status = status;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public String getAuditTitle() {
        return auditTitle;
    }

    public void setAuditTitle(String auditTitle) {
        this.auditTitle = auditTitle;
    }

    public Long getObservationId() {
        return observationId;
    }

    public void setObservationId(Long observationId) {
        this.observationId = observationId;
    }

    public String getObservationDescription() {
        return observationDescription;
    }

    public void setObservationDescription(String observationDescription) {
        this.observationDescription = observationDescription;
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

    public String getResponsibleDepartmentName() {
        return responsibleDepartmentName;
    }

    public void setResponsibleDepartmentName(String responsibleDepartmentName) {
        this.responsibleDepartmentName = responsibleDepartmentName;
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
