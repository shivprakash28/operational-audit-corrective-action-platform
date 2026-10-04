package com.audit.platform.dto;

import com.audit.platform.entity.Evidence;

import java.time.LocalDateTime;

public class EvidenceResponse {

    private Long id;
    private Long correctiveActionId;
    private Long uploadedById;
    private String uploadedByName;
    private String uploadedByEmail;
    private String fileName;
    private String fileUrl;
    private LocalDateTime uploadedAt;

    public EvidenceResponse() {
    }

    public static EvidenceResponse fromEntity(Evidence evidence) {
        EvidenceResponse response = new EvidenceResponse();
        response.setId(evidence.getId());
        if (evidence.getCorrectiveAction() != null) {
            response.setCorrectiveActionId(evidence.getCorrectiveAction().getId());
        }
        if (evidence.getUploadedBy() != null) {
            response.setUploadedById(evidence.getUploadedBy().getId());
            response.setUploadedByName(evidence.getUploadedBy().getName());
            response.setUploadedByEmail(evidence.getUploadedBy().getEmail());
        }
        response.setFileName(evidence.getFileName());
        response.setFileUrl(evidence.getFileUrl());
        response.setUploadedAt(evidence.getUploadedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCorrectiveActionId() {
        return correctiveActionId;
    }

    public void setCorrectiveActionId(Long correctiveActionId) {
        this.correctiveActionId = correctiveActionId;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public String getUploadedByEmail() {
        return uploadedByEmail;
    }

    public void setUploadedByEmail(String uploadedByEmail) {
        this.uploadedByEmail = uploadedByEmail;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
