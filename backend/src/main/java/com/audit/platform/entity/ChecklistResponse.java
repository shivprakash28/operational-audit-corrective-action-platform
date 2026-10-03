package com.audit.platform.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "ChecklistResponse",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"auditChecklistId", "checklistItemId"}
        )
    }
)
public class ChecklistResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditChecklistId", nullable = false)
    private AuditChecklist auditChecklist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklistItemId", nullable = false)
    private ChecklistItem checklistItem;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "ChecklistResponseStatus")
    private ChecklistResponseStatus status;

    private String remarks;

    @Column(nullable = false)
    private LocalDateTime respondedAt;

    public ChecklistResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AuditChecklist getAuditChecklist() {
        return auditChecklist;
    }

    public void setAuditChecklist(AuditChecklist auditChecklist) {
        this.auditChecklist = auditChecklist;
    }

    public ChecklistItem getChecklistItem() {
        return checklistItem;
    }

    public void setChecklistItem(ChecklistItem checklistItem) {
        this.checklistItem = checklistItem;
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

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }
}