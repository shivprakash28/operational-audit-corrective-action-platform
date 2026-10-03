package com.audit.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class ChecklistTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    private String description;

    public ChecklistTemplateRequest() {
    }

    public ChecklistTemplateRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
