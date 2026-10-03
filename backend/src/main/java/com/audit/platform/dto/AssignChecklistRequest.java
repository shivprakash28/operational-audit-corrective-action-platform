package com.audit.platform.dto;

import jakarta.validation.constraints.NotNull;

public class AssignChecklistRequest {

    @NotNull(message = "Template ID is required")
    private Long templateId;

    public AssignChecklistRequest() {
    }

    public AssignChecklistRequest(Long templateId) {
        this.templateId = templateId;
    }

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }
}
