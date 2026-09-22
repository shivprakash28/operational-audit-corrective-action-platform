package com.audit.platform.service;

import com.audit.platform.dto.AuditResponse;
import com.audit.platform.entity.Audit;
import com.audit.platform.repository.AuditRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
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
                        new RuntimeException("Audit not found with id: " + id)
                );

        return toResponse(audit);
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