package com.audit.platform.controller;

import com.audit.platform.dto.FindingRequest;
import com.audit.platform.dto.FindingResponse;
import com.audit.platform.entity.FindingSeverity;
import com.audit.platform.entity.FindingStatus;
import com.audit.platform.service.FindingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class FindingController {

    private final FindingService findingService;

    public FindingController(FindingService findingService) {
        this.findingService = findingService;
    }

    @PostMapping("/api/audits/{auditId}/findings")
    public ResponseEntity<FindingResponse> createFindingForAudit(
            @PathVariable Long auditId,
            @Valid @RequestBody FindingRequest request
    ) {
        FindingResponse response = findingService.createFinding(auditId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/audits/{auditId}/findings")
    public ResponseEntity<List<FindingResponse>> getFindingsByAuditId(
            @PathVariable Long auditId
    ) {
        return ResponseEntity.ok(findingService.getFindingsByAuditId(auditId));
    }

    @GetMapping("/api/audits/{auditId}/findings/{id}")
    public ResponseEntity<FindingResponse> getFindingByIdForAudit(
            @PathVariable Long auditId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(findingService.getFindingById(id));
    }

    @PostMapping("/api/findings")
    public ResponseEntity<FindingResponse> createFindingDirect(
            @Valid @RequestBody FindingRequest request
    ) {
        Long auditId = request.getAuditId();
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID is required");
        }
        FindingResponse response = findingService.createFinding(auditId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/findings")
    public ResponseEntity<List<FindingResponse>> getAllFindings() {
        return ResponseEntity.ok(findingService.getAllFindings());
    }

    @GetMapping("/api/findings/{id}")
    public ResponseEntity<FindingResponse> getFindingById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(findingService.getFindingById(id));
    }

    @PutMapping("/api/findings/{id}")
    public ResponseEntity<FindingResponse> updateFinding(
            @PathVariable Long id,
            @RequestBody FindingRequest request
    ) {
        return ResponseEntity.ok(findingService.updateFinding(id, request));
    }

    @PutMapping("/api/audits/{auditId}/findings/{id}")
    public ResponseEntity<FindingResponse> updateFindingForAudit(
            @PathVariable Long auditId,
            @PathVariable Long id,
            @RequestBody FindingRequest request
    ) {
        return ResponseEntity.ok(findingService.updateFinding(id, request));
    }

    @PatchMapping("/api/findings/{id}/status")
    public ResponseEntity<FindingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String statusStr = status;
        if ((statusStr == null || statusStr.isBlank()) && payload != null) {
            statusStr = payload.get("status");
        }
        if (statusStr == null || statusStr.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        FindingStatus newStatus;
        try {
            newStatus = FindingStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + statusStr);
        }
        return ResponseEntity.ok(findingService.updateStatus(id, newStatus));
    }

    @PatchMapping("/api/findings/{id}/severity")
    public ResponseEntity<FindingResponse> updateSeverity(
            @PathVariable Long id,
            @RequestParam(required = false) String severity,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String severityStr = severity;
        if ((severityStr == null || severityStr.isBlank()) && payload != null) {
            severityStr = payload.get("severity");
        }
        if (severityStr == null || severityStr.isBlank()) {
            throw new IllegalArgumentException("Severity is required");
        }
        FindingSeverity newSeverity;
        try {
            newSeverity = FindingSeverity.valueOf(severityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid severity value: " + severityStr);
        }
        return ResponseEntity.ok(findingService.updateSeverity(id, newSeverity));
    }
}
