package com.audit.platform.service;

import com.audit.platform.dto.ObservationRequest;
import com.audit.platform.dto.ObservationResponse;
import com.audit.platform.entity.Audit;
import com.audit.platform.entity.ChecklistItem;
import com.audit.platform.entity.Observation;
import com.audit.platform.entity.User;
import com.audit.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class ObservationService {

    private final ObservationRepository observationRepository;
    private final AuditRepository auditRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final UserRepository userRepository;
    private final AuditChecklistRepository auditChecklistRepository;

    public ObservationService(ObservationRepository observationRepository,
                              AuditRepository auditRepository,
                              ChecklistItemRepository checklistItemRepository,
                              UserRepository userRepository,
                              AuditChecklistRepository auditChecklistRepository) {
        this.observationRepository = observationRepository;
        this.auditRepository = auditRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.userRepository = userRepository;
        this.auditChecklistRepository = auditChecklistRepository;
    }

    public ObservationResponse createObservation(Long auditId, ObservationRequest request) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("Observation request must not be null");
        }
        if (request.getChecklistItemId() == null) {
            throw new IllegalArgumentException("Checklist item ID is required");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (request.getCreatedById() == null) {
            throw new IllegalArgumentException("Created by user ID is required");
        }

        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new NoSuchElementException("Audit not found with id: " + auditId));

        ChecklistItem checklistItem = checklistItemRepository.findById(request.getChecklistItemId())
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found with id: " + request.getChecklistItemId()));

        User createdBy = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getCreatedById()));

        Long templateId = checklistItem.getTemplate() != null ? checklistItem.getTemplate().getId() : null;
        if (templateId == null || !auditChecklistRepository.existsByAuditIdAndTemplateId(auditId, templateId)) {
            throw new IllegalArgumentException("Invalid relationship: Checklist item with id " + checklistItem.getId()
                    + " is not associated with audit with id " + auditId);
        }

        LocalDateTime now = LocalDateTime.now();
        Observation observation = new Observation();
        observation.setAudit(audit);
        observation.setChecklistItem(checklistItem);
        observation.setDescription(request.getDescription().trim());
        observation.setEvidenceUrl(request.getEvidenceUrl());
        observation.setCreatedBy(createdBy);
        observation.setCreatedAt(now);
        observation.setUpdatedAt(now);

        Observation saved = observationRepository.save(observation);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ObservationResponse> getObservationsByAuditId(Long auditId) {
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID must not be null");
        }
        if (!auditRepository.existsById(auditId)) {
            throw new NoSuchElementException("Audit not found with id: " + auditId);
        }

        return observationRepository.findByAuditId(auditId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ObservationResponse getObservationById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Observation ID must not be null");
        }
        Observation observation = observationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Observation not found with id: " + id));

        return mapToResponse(observation);
    }

    public ObservationResponse updateObservation(Long id, ObservationRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Observation ID must not be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("Observation request must not be null");
        }

        Observation observation = observationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Observation not found with id: " + id));

        if (request.getDescription() != null) {
            if (request.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Description cannot be empty");
            }
            observation.setDescription(request.getDescription().trim());
        }

        if (request.getEvidenceUrl() != null) {
            observation.setEvidenceUrl(request.getEvidenceUrl());
        }

        observation.setUpdatedAt(LocalDateTime.now());

        Observation saved = observationRepository.save(observation);
        return mapToResponse(saved);
    }

    private ObservationResponse mapToResponse(Observation obs) {
        ObservationResponse res = new ObservationResponse();
        res.setId(obs.getId());

        if (obs.getAudit() != null) {
            res.setAuditId(obs.getAudit().getId());
            res.setAuditTitle(obs.getAudit().getTitle());
        }

        if (obs.getChecklistItem() != null) {
            res.setChecklistItemId(obs.getChecklistItem().getId());
            res.setChecklistItemQuestion(obs.getChecklistItem().getQuestion());
        }

        res.setDescription(obs.getDescription());
        res.setEvidenceUrl(obs.getEvidenceUrl());

        if (obs.getCreatedBy() != null) {
            res.setCreatedById(obs.getCreatedBy().getId());
            res.setCreatedByName(obs.getCreatedBy().getName());
            res.setCreatedByEmail(obs.getCreatedBy().getEmail());
        }

        res.setCreatedAt(obs.getCreatedAt());
        res.setUpdatedAt(obs.getUpdatedAt());

        return res;
    }
}
