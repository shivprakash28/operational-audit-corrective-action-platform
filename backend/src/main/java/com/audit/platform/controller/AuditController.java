package com.audit.platform.controller;

import com.audit.platform.dto.AuditRequest;
import com.audit.platform.dto.AuditResponse;
import com.audit.platform.service.AuditService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<AuditResponse> createAudit(
            @Valid @RequestBody AuditRequest request
    ) {
        AuditResponse response = auditService.createAudit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AuditResponse>> getAllAudits() {
        return ResponseEntity.ok(auditService.getAllAudits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditResponse> getAuditById(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(auditService.getAuditById(id));
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditResponse> updateAudit(
            @PathVariable Long id,
            @Valid @RequestBody AuditRequest request
    ) {
        try {
            return ResponseEntity.ok(
                    auditService.updateAudit(id, request)
            );
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudit(
            @PathVariable Long id
    ) {
        try {
            auditService.deleteAudit(id);
            return ResponseEntity.noContent().build();
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}