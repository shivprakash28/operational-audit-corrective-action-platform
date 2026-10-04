package com.audit.platform.controller;

import com.audit.platform.dto.ObservationRequest;
import com.audit.platform.dto.ObservationResponse;
import com.audit.platform.service.ObservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ObservationController {

    private final ObservationService observationService;

    public ObservationController(ObservationService observationService) {
        this.observationService = observationService;
    }

    @PostMapping("/api/audits/{auditId}/observations")
    public ResponseEntity<ObservationResponse> createObservationForAudit(
            @PathVariable Long auditId,
            @Valid @RequestBody ObservationRequest request
    ) {
        ObservationResponse response = observationService.createObservation(auditId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/audits/{auditId}/observations")
    public ResponseEntity<List<ObservationResponse>> getObservationsByAuditId(
            @PathVariable Long auditId
    ) {
        return ResponseEntity.ok(observationService.getObservationsByAuditId(auditId));
    }

    @GetMapping("/api/audits/{auditId}/observations/{id}")
    public ResponseEntity<ObservationResponse> getObservationByIdForAudit(
            @PathVariable Long auditId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(observationService.getObservationById(id));
    }

    @PostMapping("/api/observations")
    public ResponseEntity<ObservationResponse> createObservationDirect(
            @Valid @RequestBody ObservationRequest request
    ) {
        Long auditId = request.getAuditId();
        if (auditId == null) {
            throw new IllegalArgumentException("Audit ID is required");
        }
        ObservationResponse response = observationService.createObservation(auditId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/observations/{id}")
    public ResponseEntity<ObservationResponse> getObservationById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(observationService.getObservationById(id));
    }

    @PutMapping("/api/observations/{id}")
    public ResponseEntity<ObservationResponse> updateObservation(
            @PathVariable Long id,
            @RequestBody ObservationRequest request
    ) {
        return ResponseEntity.ok(observationService.updateObservation(id, request));
    }

    @PutMapping("/api/audits/{auditId}/observations/{id}")
    public ResponseEntity<ObservationResponse> updateObservationForAudit(
            @PathVariable Long auditId,
            @PathVariable Long id,
            @RequestBody ObservationRequest request
    ) {
        return ResponseEntity.ok(observationService.updateObservation(id, request));
    }
}
