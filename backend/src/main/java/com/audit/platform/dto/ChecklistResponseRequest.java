package com.audit.platform.dto;

import com.audit.platform.entity.ChecklistResponseStatus;
import jakarta.validation.constraints.NotNull;

public class ChecklistResponseRequest {

    @NotNull(message = "Checklist item ID is required")
    private Long checklistItemId;

    @NotNull(message = "Response status is required")
    private ChecklistResponseStatus status;

    private String remarks;

    public ChecklistResponseRequest() {
    }

    public ChecklistResponseRequest(Long checklistItemId, ChecklistResponseStatus status, String remarks) {
        this.checklistItemId = checklistItemId;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getChecklistItemId() {
        return checklistItemId;
    }

    public void setChecklistItemId(Long checklistItemId) {
        this.checklistItemId = checklistItemId;
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
}
