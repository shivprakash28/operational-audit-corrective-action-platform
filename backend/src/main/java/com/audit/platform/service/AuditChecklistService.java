package com.audit.platform.service;

import com.audit.platform.dto.AssignChecklistRequest;
import com.audit.platform.dto.AuditChecklistResponse;
import com.audit.platform.dto.ChecklistResponseDto;
import com.audit.platform.dto.ChecklistResponseRequest;
import com.audit.platform.entity.*;
import com.audit.platform.repository.AuditChecklistRepository;
import com.audit.platform.repository.AuditRepository;
import com.audit.platform.repository.ChecklistItemRepository;
import com.audit.platform.repository.ChecklistResponseRepository;
import com.audit.platform.repository.ChecklistTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuditChecklistService {

    private final AuditRepository auditRepository;
    private final ChecklistTemplateRepository checklistTemplateRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final AuditChecklistRepository auditChecklistRepository;
    private final ChecklistResponseRepository checklistResponseRepository;

    public AuditChecklistService(AuditRepository auditRepository,
                                ChecklistTemplateRepository checklistTemplateRepository,
                                ChecklistItemRepository checklistItemRepository,
                                AuditChecklistRepository auditChecklistRepository,
                                ChecklistResponseRepository checklistResponseRepository) {
        this.auditRepository = auditRepository;
        this.checklistTemplateRepository = checklistTemplateRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.auditChecklistRepository = auditChecklistRepository;
        this.checklistResponseRepository = checklistResponseRepository;
    }

    public AuditChecklistResponse assignChecklist(Long auditId, AssignChecklistRequest request) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (request == null || request.getTemplateId() == null) {
            throw new IllegalArgumentException("Template ID must not be null");
        }

        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new NoSuchElementException("Audit not found with id: " + auditId));

        ChecklistTemplate template = checklistTemplateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new IllegalArgumentException("Checklist template not found with id: " + request.getTemplateId()));

        if (auditChecklistRepository.existsByAuditIdAndTemplateId(auditId, template.getId())) {
            throw new IllegalArgumentException("Checklist template with id " + template.getId()
                    + " is already assigned to audit with id " + auditId);
        }

        AuditChecklist auditChecklist = new AuditChecklist();
        auditChecklist.setAudit(audit);
        auditChecklist.setTemplate(template);
        auditChecklist.setAssignedAt(LocalDateTime.now());

        AuditChecklist saved = auditChecklistRepository.save(auditChecklist);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AuditChecklistResponse> getAuditChecklists(Long auditId) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (!auditRepository.existsById(auditId)) {
            throw new NoSuchElementException("Audit not found with id: " + auditId);
        }

        return auditChecklistRepository.findByAuditId(auditId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ChecklistResponseDto submitResponse(Long auditId, Long auditChecklistId, ChecklistResponseRequest request) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (auditChecklistId == null) {
            throw new IllegalArgumentException("Audit checklist ID must not be null");
        }
        if (request == null || request.getChecklistItemId() == null) {
            throw new IllegalArgumentException("Checklist item ID must not be null");
        }
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Response status must not be null");
        }

        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new NoSuchElementException("Audit not found with id: " + auditId));

        AuditChecklist auditChecklist = auditChecklistRepository.findById(auditChecklistId)
                .orElseThrow(() -> new NoSuchElementException("Audit checklist not found with id: " + auditChecklistId));

        if (!auditChecklist.getAudit().getId().equals(audit.getId())) {
            throw new IllegalArgumentException("Audit checklist with id " + auditChecklistId
                    + " does not belong to audit with id " + auditId);
        }

        ChecklistItem checklistItem = checklistItemRepository.findById(request.getChecklistItemId())
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found with id: " + request.getChecklistItemId()));

        if (!checklistItem.getTemplate().getId().equals(auditChecklist.getTemplate().getId())) {
            throw new IllegalArgumentException("Checklist item with id " + checklistItem.getId()
                    + " does not belong to template with id " + auditChecklist.getTemplate().getId()
                    + " assigned to this audit");
        }

        ChecklistResponse response = checklistResponseRepository
                .findByAuditChecklistIdAndChecklistItemId(auditChecklist.getId(), checklistItem.getId())
                .orElseGet(ChecklistResponse::new);

        response.setAuditChecklist(auditChecklist);
        response.setChecklistItem(checklistItem);
        response.setStatus(request.getStatus());
        response.setRemarks(request.getRemarks());
        response.setRespondedAt(LocalDateTime.now());

        ChecklistResponse saved = checklistResponseRepository.save(response);
        return mapResponseToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ChecklistResponseDto> getResponses(Long auditId, Long auditChecklistId) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (auditChecklistId == null) {
            throw new IllegalArgumentException("Audit checklist ID must not be null");
        }
        if (!auditRepository.existsById(auditId)) {
            throw new NoSuchElementException("Audit not found with id: " + auditId);
        }

        AuditChecklist auditChecklist = auditChecklistRepository.findById(auditChecklistId)
                .orElseThrow(() -> new NoSuchElementException("Audit checklist not found with id: " + auditChecklistId));

        if (!auditChecklist.getAudit().getId().equals(auditId)) {
            throw new IllegalArgumentException("Audit checklist with id " + auditChecklistId
                    + " does not belong to audit with id " + auditId);
        }

        return checklistResponseRepository.findByAuditChecklistId(auditChecklistId).stream()
                .map(this::mapResponseToDto)
                .collect(Collectors.toList());
    }

    private AuditChecklistResponse mapToResponse(AuditChecklist auditChecklist) {
        AuditChecklistResponse response = new AuditChecklistResponse();
        response.setId(auditChecklist.getId());
        if (auditChecklist.getAudit() != null) {
            response.setAuditId(auditChecklist.getAudit().getId());
        }
        if (auditChecklist.getTemplate() != null) {
            response.setTemplateId(auditChecklist.getTemplate().getId());
            response.setTemplateName(auditChecklist.getTemplate().getName());
            response.setTemplateDescription(auditChecklist.getTemplate().getDescription());
        }
        response.setAssignedAt(auditChecklist.getAssignedAt());
        return response;
    }

    private ChecklistResponseDto mapResponseToDto(ChecklistResponse response) {
        ChecklistResponseDto dto = new ChecklistResponseDto();
        dto.setId(response.getId());
        if (response.getAuditChecklist() != null) {
            dto.setAuditChecklistId(response.getAuditChecklist().getId());
        }
        if (response.getChecklistItem() != null) {
            dto.setChecklistItemId(response.getChecklistItem().getId());
            dto.setQuestion(response.getChecklistItem().getQuestion());
        }
        dto.setStatus(response.getStatus());
        dto.setRemarks(response.getRemarks());
        dto.setRespondedAt(response.getRespondedAt());
        return dto;
    }
}
