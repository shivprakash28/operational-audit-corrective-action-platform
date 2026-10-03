package com.audit.platform.dto;

import java.time.LocalDateTime;

public class AuditAssignmentResponse {

    private Long id;
    private Long auditId;
    private Long auditorId;
    private String auditorName;
    private String auditorEmail;
    private String auditorRole;
    private Long auditorDepartmentId;
    private String auditorDepartmentName;
    private LocalDateTime assignedAt;

    public AuditAssignmentResponse() {
    }

    public AuditAssignmentResponse(Long id, Long auditId, Long auditorId, String auditorName,
                                   String auditorEmail, String auditorRole, Long auditorDepartmentId,
                                   String auditorDepartmentName, LocalDateTime assignedAt) {
        this.id = id;
        this.auditId = auditId;
        this.auditorId = auditorId;
        this.auditorName = auditorName;
        this.auditorEmail = auditorEmail;
        this.auditorRole = auditorRole;
        this.auditorDepartmentId = auditorDepartmentId;
        this.auditorDepartmentName = auditorDepartmentName;
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

    public Long getAuditorId() {
        return auditorId;
    }

    public void setAuditorId(Long auditorId) {
        this.auditorId = auditorId;
    }

    public String getAuditorName() {
        return auditorName;
    }

    public void setAuditorName(String auditorName) {
        this.auditorName = auditorName;
    }

    public String getAuditorEmail() {
        return auditorEmail;
    }

    public void setAuditorEmail(String auditorEmail) {
        this.auditorEmail = auditorEmail;
    }

    public String getAuditorRole() {
        return auditorRole;
    }

    public void setAuditorRole(String auditorRole) {
        this.auditorRole = auditorRole;
    }

    public Long getAuditorDepartmentId() {
        return auditorDepartmentId;
    }

    public void setAuditorDepartmentId(Long auditorDepartmentId) {
        this.auditorDepartmentId = auditorDepartmentId;
    }

    public String getAuditorDepartmentName() {
        return auditorDepartmentName;
    }

    public void setAuditorDepartmentName(String auditorDepartmentName) {
        this.auditorDepartmentName = auditorDepartmentName;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
