package com.audit.platform.controller;

import com.audit.platform.dto.AssignAuditorRequest;
import com.audit.platform.dto.AuditAssignmentResponse;
import com.audit.platform.service.AuditAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
public class AuditAssignmentController {

    private final AuditAssignmentService auditAssignmentService;

    public AuditAssignmentController(AuditAssignmentService auditAssignmentService) {
        this.auditAssignmentService = auditAssignmentService;
    }

    @PostMapping("/{auditId}/assign")
    public ResponseEntity<AuditAssignmentResponse> assignAuditor(
            @PathVariable Long auditId,
            @Valid @RequestBody AssignAuditorRequest request
    ) {
        AuditAssignmentResponse response = auditAssignmentService.assignAuditor(auditId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{auditId}/assignments")
    public ResponseEntity<List<AuditAssignmentResponse>> getAssignments(
            @PathVariable Long auditId
    ) {
        List<AuditAssignmentResponse> assignments = auditAssignmentService.getAssignments(auditId);
        return ResponseEntity.ok(assignments);
    }
}
