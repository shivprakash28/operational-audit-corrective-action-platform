package com.audit.platform.service;

import com.audit.platform.dto.FindingRequest;
import com.audit.platform.dto.FindingResponse;
import com.audit.platform.entity.*;
import com.audit.platform.repository.AuditRepository;
import com.audit.platform.repository.DepartmentRepository;
import com.audit.platform.repository.FindingRepository;
import com.audit.platform.repository.ObservationRepository;
import com.audit.platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class FindingService {

    private final FindingRepository findingRepository;
    private final AuditRepository auditRepository;
    private final ObservationRepository observationRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public FindingService(FindingRepository findingRepository,
                          AuditRepository auditRepository,
                          ObservationRepository observationRepository,
                          DepartmentRepository departmentRepository,
                          UserRepository userRepository) {
        this.findingRepository = findingRepository;
        this.auditRepository = auditRepository;
        this.observationRepository = observationRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    public FindingResponse createFinding(Long auditIdParam, FindingRequest request) {
        Long targetAuditId = auditIdParam != null ? auditIdParam : request.getAuditId();
        if (targetAuditId == null) {
            throw new IllegalArgumentException("Audit ID is required");
        }

        Audit audit = auditRepository.findById(targetAuditId)
                .orElseThrow(() -> new NoSuchElementException("Audit not found with id: " + targetAuditId));

        if (request.getObservationId() == null) {
            throw new IllegalArgumentException("Observation ID is required");
        }

        Observation observation = observationRepository.findById(request.getObservationId())
                .orElseThrow(() -> new IllegalArgumentException("Observation not found with id: " + request.getObservationId()));

        if (!observation.getAudit().getId().equals(audit.getId())) {
            throw new IllegalArgumentException("Invalid relationship: Observation with id "
                    + request.getObservationId() + " does not belong to audit with id " + targetAuditId);
        }

        if (findingRepository.existsByObservationId(request.getObservationId())) {
            throw new IllegalArgumentException("Finding already exists for observation with id: " + request.getObservationId());
        }

        if (request.getResponsibleDepartmentId() == null) {
            throw new IllegalArgumentException("Responsible department ID is required");
        }

        Department department = departmentRepository.findById(request.getResponsibleDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Responsible department not found with id: " + request.getResponsibleDepartmentId()));

        User owner = null;
        if (request.getOwnerId() != null) {
            owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Owner user not found with id: " + request.getOwnerId()));
        }

        if (request.getSeverity() == null) {
            throw new IllegalArgumentException("Severity is required");
        }

        FindingStatus status = request.getStatus() != null ? request.getStatus() : FindingStatus.OPEN;

        Finding finding = new Finding();
        finding.setAudit(audit);
        finding.setObservation(observation);
        finding.setSeverity(request.getSeverity());
        finding.setResponsibleDepartment(department);
        finding.setOwner(owner);
        finding.setStatus(status);
        finding.setDescription(request.getDescription());
        LocalDateTime now = LocalDateTime.now();
        finding.setCreatedAt(now);
        finding.setUpdatedAt(now);

        Finding saved = findingRepository.save(finding);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FindingResponse> getFindingsByAuditId(Long auditId) {
        if (!auditRepository.existsById(auditId)) {
            throw new NoSuchElementException("Audit not found with id: " + auditId);
        }
        return findingRepository.findByAuditId(auditId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FindingResponse> getAllFindings() {
        return findingRepository.findAllWithDetails()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FindingResponse getFindingById(Long id) {
        Finding finding = findingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Finding not found with id: " + id));
        return mapToResponse(finding);
    }

    public FindingResponse updateFinding(Long id, FindingRequest request) {
        Finding finding = findingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Finding not found with id: " + id));

        if (request.getSeverity() != null) {
            finding.setSeverity(request.getSeverity());
        }

        if (request.getStatus() != null) {
            finding.setStatus(request.getStatus());
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            finding.setDescription(request.getDescription());
        }

        if (request.getResponsibleDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getResponsibleDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Responsible department not found with id: " + request.getResponsibleDepartmentId()));
            finding.setResponsibleDepartment(department);
        }

        if (request.getOwnerId() != null) {
            User owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Owner user not found with id: " + request.getOwnerId()));
            finding.setOwner(owner);
        }

        finding.setUpdatedAt(LocalDateTime.now());
        Finding updated = findingRepository.save(finding);
        return mapToResponse(updated);
    }

    public FindingResponse updateStatus(Long id, FindingStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        Finding finding = findingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Finding not found with id: " + id));
        finding.setStatus(status);
        finding.setUpdatedAt(LocalDateTime.now());
        Finding updated = findingRepository.save(finding);
        return mapToResponse(updated);
    }

    public FindingResponse updateSeverity(Long id, FindingSeverity severity) {
        if (severity == null) {
            throw new IllegalArgumentException("Severity is required");
        }
        Finding finding = findingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Finding not found with id: " + id));
        finding.setSeverity(severity);
        finding.setUpdatedAt(LocalDateTime.now());
        Finding updated = findingRepository.save(finding);
        return mapToResponse(updated);
    }

    private FindingResponse mapToResponse(Finding finding) {
        FindingResponse response = new FindingResponse();
        response.setId(finding.getId());
        if (finding.getAudit() != null) {
            response.setAuditId(finding.getAudit().getId());
            response.setAuditTitle(finding.getAudit().getTitle());
        }
        if (finding.getObservation() != null) {
            response.setObservationId(finding.getObservation().getId());
            response.setObservationDescription(finding.getObservation().getDescription());
        }
        response.setSeverity(finding.getSeverity());
        if (finding.getResponsibleDepartment() != null) {
            response.setResponsibleDepartmentId(finding.getResponsibleDepartment().getId());
            response.setResponsibleDepartmentName(finding.getResponsibleDepartment().getName());
        }
        if (finding.getOwner() != null) {
            response.setOwnerId(finding.getOwner().getId());
            response.setOwnerName(finding.getOwner().getName());
            response.setOwnerEmail(finding.getOwner().getEmail());
        }
        response.setStatus(finding.getStatus());
        response.setDescription(finding.getDescription());
        response.setCreatedAt(finding.getCreatedAt());
        response.setUpdatedAt(finding.getUpdatedAt());
        return response;
    }
}
