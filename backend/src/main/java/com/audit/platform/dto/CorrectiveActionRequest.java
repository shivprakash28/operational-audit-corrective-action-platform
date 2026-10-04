package com.audit.platform.dto;

import com.audit.platform.entity.CorrectiveActionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CorrectiveActionRequest {

    private Long findingId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    private LocalDateTime dueDate;

    private LocalDateTime deadline;

    private CorrectiveActionStatus status;

    public CorrectiveActionRequest() {
    }

    public CorrectiveActionRequest(Long findingId, String title, String description, Long ownerId, LocalDateTime dueDate, CorrectiveActionStatus status) {
        this.findingId = findingId;
        this.title = title;
        this.description = description;
        this.ownerId = ownerId;
        this.dueDate = dueDate;
        this.status = status;
    }

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDateTime getDueDate() {
        return dueDate != null ? dueDate : deadline;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getDeadline() {
        return deadline != null ? deadline : dueDate;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public CorrectiveActionStatus getStatus() {
        return status;
    }

    public void setStatus(CorrectiveActionStatus status) {
        this.status = status;
    }
}
