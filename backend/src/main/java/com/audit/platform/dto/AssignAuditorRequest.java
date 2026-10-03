package com.audit.platform.dto;

import jakarta.validation.constraints.NotNull;

public class AssignAuditorRequest {

    @NotNull(message = "Auditor ID is required")
    private Long auditorId;

    public AssignAuditorRequest() {
    }

    public AssignAuditorRequest(Long auditorId) {
        this.auditorId = auditorId;
    }

    public Long getAuditorId() {
        return auditorId;
    }

    public void setAuditorId(Long auditorId) {
        this.auditorId = auditorId;
    }

    // Alias for compatibility if client passes userId
    public Long getUserId() {
        return auditorId;
    }

    public void setUserId(Long userId) {
        if (this.auditorId == null) {
            this.auditorId = userId;
        }
    }
}
