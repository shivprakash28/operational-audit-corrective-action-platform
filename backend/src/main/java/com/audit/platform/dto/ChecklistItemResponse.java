package com.audit.platform.dto;

public class ChecklistItemResponse {

    private Long id;
    private Long templateId;
    private String question;
    private String description;
    private Integer order;

    public ChecklistItemResponse() {
    }

    public ChecklistItemResponse(Long id, Long templateId, String question,
                                String description, Integer order) {
        this.id = id;
        this.templateId = templateId;
        this.question = question;
        this.description = description;
        this.order = order;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
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
