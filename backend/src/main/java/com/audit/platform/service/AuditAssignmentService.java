package com.audit.platform.service;

import com.audit.platform.dto.AssignAuditorRequest;
import com.audit.platform.dto.AuditAssignmentResponse;
import com.audit.platform.entity.Audit;
import com.audit.platform.entity.AuditAssignment;
import com.audit.platform.entity.Role;
import com.audit.platform.entity.User;
import com.audit.platform.repository.AuditAssignmentRepository;
import com.audit.platform.repository.AuditRepository;
import com.audit.platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuditAssignmentService {

    private final AuditRepository auditRepository;
    private final UserRepository userRepository;
    private final AuditAssignmentRepository auditAssignmentRepository;

    public AuditAssignmentService(
            AuditRepository auditRepository,
            UserRepository userRepository,
            AuditAssignmentRepository auditAssignmentRepository
    ) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
        this.auditAssignmentRepository = auditAssignmentRepository;
    }

    public AuditAssignmentResponse assignAuditor(Long auditId, AssignAuditorRequest request) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (request == null || request.getAuditorId() == null) {
            throw new IllegalArgumentException("Auditor ID must not be null");
        }

        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new NoSuchElementException("Audit not found with id: " + auditId));

        User auditor = userRepository.findById(request.getAuditorId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getAuditorId()));

        if (auditor.getRole() != Role.AUDITOR) {
            throw new IllegalArgumentException("User with id " + auditor.getId() + " is not an auditor. Current role: " + auditor.getRole());
        }

        if (auditor.getDepartment() != null && audit.getDepartment() != null
                && auditor.getDepartment().getId() != null
                && auditor.getDepartment().getId().equals(audit.getDepartment().getId())) {
            throw new IllegalArgumentException("Conflict of interest: Auditor belongs to the department being audited (department id: "
                    + audit.getDepartment().getId() + ")");
        }

        if (auditAssignmentRepository.existsByAuditIdAndAuditorId(auditId, auditor.getId())) {
            throw new IllegalArgumentException("Auditor is already assigned to this audit");
        }

        AuditAssignment assignment = new AuditAssignment();
        assignment.setAudit(audit);
        assignment.setAuditor(auditor);
        assignment.setAssignedAt(LocalDateTime.now());

        AuditAssignment saved = auditAssignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AuditAssignmentResponse> getAssignments(Long auditId) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }

        if (!auditRepository.existsById(auditId)) {
            throw new NoSuchElementException("Audit not found with id: " + auditId);
        }

        List<AuditAssignment> assignments = auditAssignmentRepository.findByAuditId(auditId);
        return assignments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AuditAssignmentResponse mapToResponse(AuditAssignment assignment) {
        AuditAssignmentResponse response = new AuditAssignmentResponse();
        response.setId(assignment.getId());

        if (assignment.getAudit() != null) {
            response.setAuditId(assignment.getAudit().getId());
        }

        User auditor = assignment.getAuditor();
        if (auditor != null) {
            response.setAuditorId(auditor.getId());
            response.setAuditorName(auditor.getName());
            response.setAuditorEmail(auditor.getEmail());
            response.setAuditorRole(auditor.getRole() != null ? auditor.getRole().name() : null);
            if (auditor.getDepartment() != null) {
                response.setAuditorDepartmentId(auditor.getDepartment().getId());
                response.setAuditorDepartmentName(auditor.getDepartment().getName());
            }
        }

        response.setAssignedAt(assignment.getAssignedAt());
        return response;
    }
}
