package com.audit.platform.dto;

import com.audit.platform.entity.AuditStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AuditRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String scope;

    @NotBlank
    private String objectives;

    @NotBlank
    private String criteria;

    @NotNull
    private LocalDateTime plannedStartDate;

    @NotNull
    private LocalDateTime plannedEndDate;

    private LocalDateTime expectedCompletionDate;

    private AuditStatus status;

    @NotNull
    private Long departmentId;

    @NotNull
    private Long createdById;

    public AuditRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getObjectives() {
        return objectives;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }

    public String getCriteria() {
        return criteria;
    }

    public void setCriteria(String criteria) {
        this.criteria = criteria;
    }

    public LocalDateTime getPlannedStartDate() {
        return plannedStartDate;
    }

    public void setPlannedStartDate(LocalDateTime plannedStartDate) {
        this.plannedStartDate = plannedStartDate;
    }

    public LocalDateTime getPlannedEndDate() {
        return plannedEndDate;
    }

    public void setPlannedEndDate(LocalDateTime plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
    }

    public LocalDateTime getExpectedCompletionDate() {
        return expectedCompletionDate;
    }

    public void setExpectedCompletionDate(LocalDateTime expectedCompletionDate) {
        this.expectedCompletionDate = expectedCompletionDate;
    }

    public AuditStatus getStatus() {
        return status;
    }

    public void setStatus(AuditStatus status) {
        this.status = status;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
}
