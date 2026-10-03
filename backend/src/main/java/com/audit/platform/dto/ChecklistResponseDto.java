package com.audit.platform.dto;

import com.audit.platform.entity.ChecklistResponseStatus;

import java.time.LocalDateTime;

public class ChecklistResponseDto {

    private Long id;
    private Long auditChecklistId;
    private Long checklistItemId;
    private String question;
    private ChecklistResponseStatus status;
    private String remarks;
    private LocalDateTime respondedAt;

    public ChecklistResponseDto() {
    }

    public ChecklistResponseDto(Long id, Long auditChecklistId, Long checklistItemId,
                               String question, ChecklistResponseStatus status,
                               String remarks, LocalDateTime respondedAt) {
        this.id = id;
        this.auditChecklistId = auditChecklistId;
        this.checklistItemId = checklistItemId;
        this.question = question;
        this.status = status;
        this.remarks = remarks;
        this.respondedAt = respondedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuditChecklistId() {
        return auditChecklistId;
    }

    public void setAuditChecklistId(Long auditChecklistId) {
        this.auditChecklistId = auditChecklistId;
    }

    public Long getChecklistItemId() {
        return checklistItemId;
    }

    public void setChecklistItemId(Long checklistItemId) {
        this.checklistItemId = checklistItemId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public ChecklistResponseStatus getStatus() {
        return status;
    }

    public void setStatus(ChecklistResponseStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }
}
