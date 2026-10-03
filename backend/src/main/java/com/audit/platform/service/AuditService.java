package com.audit.platform.service;

import com.audit.platform.dto.AuditRequest;
import com.audit.platform.dto.AuditResponse;
import com.audit.platform.entity.Audit;
import com.audit.platform.entity.Department;
import com.audit.platform.entity.User;
import com.audit.platform.repository.AuditRepository;
import com.audit.platform.repository.DepartmentRepository;
import com.audit.platform.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public AuditService(
            AuditRepository auditRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository
    ) {
        this.auditRepository = auditRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    public List<AuditResponse> getAllAudits() {
        return auditRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AuditResponse getAuditById(Long id) {
        Audit audit = auditRepository.findById(id)
                .orElseThrow(() ->
                        new java.util.NoSuchElementException("Audit not found with id: " + id)
                );

        return toResponse(audit);
    }

    public AuditResponse createAudit(AuditRequest request) {

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Department not found with id: " + request.getDepartmentId()
                        )
                );

        User createdBy = userRepository.findById(request.getCreatedById())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + request.getCreatedById()
                        )
                );

        Audit audit = new Audit();

        audit.setTitle(request.getTitle());
        audit.setScope(request.getScope());
        audit.setObjectives(request.getObjectives());
        audit.setCriteria(request.getCriteria());
        audit.setPlannedStartDate(request.getPlannedStartDate());
        audit.setPlannedEndDate(request.getPlannedEndDate());
        audit.setExpectedCompletionDate(request.getExpectedCompletionDate());

        if (request.getStatus() != null) {
            audit.setStatus(request.getStatus());
        }

        audit.setDepartment(department);
        audit.setCreatedBy(createdBy);

        LocalDateTime now = LocalDateTime.now();
        audit.setCreatedAt(now);
        audit.setUpdatedAt(now);

        Audit savedAudit = auditRepository.save(audit);

        return toResponse(savedAudit);
    }

    public AuditResponse updateAudit(Long id, AuditRequest request) {

        Audit audit = auditRepository.findById(id)
                .orElseThrow(() ->
                        new java.util.NoSuchElementException("Audit not found with id: " + id)
                );

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Department not found with id: " + request.getDepartmentId()
                        )
                );

        User createdBy = userRepository.findById(request.getCreatedById())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + request.getCreatedById()
                        )
                );

        audit.setTitle(request.getTitle());
        audit.setScope(request.getScope());
        audit.setObjectives(request.getObjectives());
        audit.setCriteria(request.getCriteria());
        audit.setPlannedStartDate(request.getPlannedStartDate());
        audit.setPlannedEndDate(request.getPlannedEndDate());
        audit.setExpectedCompletionDate(request.getExpectedCompletionDate());

        if (request.getStatus() != null) {
            audit.setStatus(request.getStatus());
        }

        audit.setDepartment(department);
        audit.setCreatedBy(createdBy);
        audit.setUpdatedAt(LocalDateTime.now());

        Audit updatedAudit = auditRepository.save(audit);

        return toResponse(updatedAudit);
    }

    public void deleteAudit(Long id) {

        if (!auditRepository.existsById(id)) {
            throw new java.util.NoSuchElementException("Audit not found with id: " + id);
        }

        auditRepository.deleteById(id);
    }

    private AuditResponse toResponse(Audit audit) {
        AuditResponse response = new AuditResponse();

        response.setId(audit.getId());
        response.setTitle(audit.getTitle());
        response.setScope(audit.getScope());
        response.setObjectives(audit.getObjectives());
        response.setCriteria(audit.getCriteria());
        response.setPlannedStartDate(audit.getPlannedStartDate());
        response.setPlannedEndDate(audit.getPlannedEndDate());
        response.setExpectedCompletionDate(audit.getExpectedCompletionDate());
        response.setStatus(audit.getStatus());

        if (audit.getDepartment() != null) {
            response.setDepartmentId(audit.getDepartment().getId());
            response.setDepartmentName(audit.getDepartment().getName());
        }

        if (audit.getCreatedBy() != null) {
            response.setCreatedById(audit.getCreatedBy().getId());
            response.setCreatedByName(audit.getCreatedBy().getName());
        }

        response.setCreatedAt(audit.getCreatedAt());
        response.setUpdatedAt(audit.getUpdatedAt());

        return response;
    }
}