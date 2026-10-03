package com.audit.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChecklistItemRequest {

    @NotBlank(message = "Question is required")
    private String question;

    private String description;

    @NotNull(message = "Order is required")
    private Integer order;

    public ChecklistItemRequest() {
    }

    public ChecklistItemRequest(String question, String description, Integer order) {
        this.question = question;
        this.description = description;
        this.order = order;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}
