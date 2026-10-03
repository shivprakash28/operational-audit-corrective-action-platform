package com.audit.platform.controller;

import com.audit.platform.dto.AssignChecklistRequest;
import com.audit.platform.dto.AuditChecklistResponse;
import com.audit.platform.dto.ChecklistResponseDto;
import com.audit.platform.dto.ChecklistResponseRequest;
import com.audit.platform.service.AuditChecklistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
public class AuditChecklistController {

    private final AuditChecklistService auditChecklistService;

    public AuditChecklistController(AuditChecklistService auditChecklistService) {
        this.auditChecklistService = auditChecklistService;
    }

    @PostMapping("/{auditId}/checklists")
    public ResponseEntity<AuditChecklistResponse> assignChecklist(
            @PathVariable Long auditId,
            @Valid @RequestBody AssignChecklistRequest request
    ) {
        AuditChecklistResponse response = auditChecklistService.assignChecklist(auditId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{auditId}/checklists")
    public ResponseEntity<List<AuditChecklistResponse>> getAuditChecklists(
            @PathVariable Long auditId
    ) {
        return ResponseEntity.ok(auditChecklistService.getAuditChecklists(auditId));
    }

    @PostMapping("/{auditId}/checklists/{auditChecklistId}/responses")
    public ResponseEntity<ChecklistResponseDto> submitResponse(
            @PathVariable Long auditId,
            @PathVariable Long auditChecklistId,
            @Valid @RequestBody ChecklistResponseRequest request
    ) {
        ChecklistResponseDto response = auditChecklistService.submitResponse(auditId, auditChecklistId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{auditId}/checklists/{auditChecklistId}/responses")
    public ResponseEntity<List<ChecklistResponseDto>> getResponses(
            @PathVariable Long auditId,
            @PathVariable Long auditChecklistId
    ) {
        return ResponseEntity.ok(auditChecklistService.getResponses(auditId, auditChecklistId));
    }
}
