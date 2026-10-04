package com.audit.platform.dto;

import java.time.LocalDateTime;

public class ObservationResponse {

    private Long id;
    private Long auditId;
    private String auditTitle;
    private Long checklistItemId;
    private String checklistItemQuestion;
    private String description;
    private String evidenceUrl;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ObservationResponse() {
    }

    public ObservationResponse(Long id, Long auditId, String auditTitle, Long checklistItemId,
                               String checklistItemQuestion, String description, String evidenceUrl,
                               Long createdById, String createdByName, String createdByEmail,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.auditId = auditId;
        this.auditTitle = auditTitle;
        this.checklistItemId = checklistItemId;
        this.checklistItemQuestion = checklistItemQuestion;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.createdByEmail = createdByEmail;
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

    public Long getChecklistItemId() {
        return checklistItemId;
    }

    public void setChecklistItemId(Long checklistItemId) {
        this.checklistItemId = checklistItemId;
    }

    public String getChecklistItemQuestion() {
        return checklistItemQuestion;
    }

    public void setChecklistItemQuestion(String checklistItemQuestion) {
        this.checklistItemQuestion = checklistItemQuestion;
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

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
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
