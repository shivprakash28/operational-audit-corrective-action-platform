package com.audit.platform.dto;

import java.time.LocalDateTime;

public class AuditChecklistResponse {

    private Long id;
    private Long auditId;
    private Long templateId;
    private String templateName;
    private String templateDescription;
    private LocalDateTime assignedAt;

    public AuditChecklistResponse() {
    }

    public AuditChecklistResponse(Long id, Long auditId, Long templateId,
                                 String templateName, String templateDescription,
                                 LocalDateTime assignedAt) {
        this.id = id;
        this.auditId = auditId;
        this.templateId = templateId;
        this.templateName = templateName;
        this.templateDescription = templateDescription;
        this.assignedAt = assignedAt;
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

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateDescription() {
        return templateDescription;
    }

    public void setTemplateDescription(String templateDescription) {
        this.templateDescription = templateDescription;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
