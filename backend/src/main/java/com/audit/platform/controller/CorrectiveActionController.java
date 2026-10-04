package com.audit.platform.controller;

import com.audit.platform.dto.CorrectiveActionRequest;
import com.audit.platform.dto.CorrectiveActionResponse;
import com.audit.platform.entity.CorrectiveActionStatus;
import com.audit.platform.service.CorrectiveActionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class CorrectiveActionController {

    private final CorrectiveActionService correctiveActionService;

    public CorrectiveActionController(CorrectiveActionService correctiveActionService) {
        this.correctiveActionService = correctiveActionService;
    }

    @PostMapping("/api/findings/{findingId}/corrective-actions")
    public ResponseEntity<CorrectiveActionResponse> createCorrectiveActionForFinding(
            @PathVariable Long findingId,
            @Valid @RequestBody CorrectiveActionRequest request
    ) {
        CorrectiveActionResponse response = correctiveActionService.createCorrectiveAction(findingId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/api/corrective-actions")
    public ResponseEntity<CorrectiveActionResponse> createCorrectiveActionDirect(
            @Valid @RequestBody CorrectiveActionRequest request
    ) {
        Long findingId = request.getFindingId();
        if (findingId == null) {
            throw new IllegalArgumentException("Finding ID is required");
        }
        CorrectiveActionResponse response = correctiveActionService.createCorrectiveAction(findingId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/findings/{findingId}/corrective-actions")
    public ResponseEntity<List<CorrectiveActionResponse>> getCorrectiveActionsByFindingId(
            @PathVariable Long findingId
    ) {
        return ResponseEntity.ok(correctiveActionService.getCorrectiveActionsByFindingId(findingId));
    }

    @GetMapping("/api/corrective-actions")
    public ResponseEntity<List<CorrectiveActionResponse>> getAllCorrectiveActions() {
        return ResponseEntity.ok(correctiveActionService.getAllCorrectiveActions());
    }

    @GetMapping("/api/corrective-actions/overdue")
    public ResponseEntity<List<CorrectiveActionResponse>> getOverdueCorrectiveActions() {
        return ResponseEntity.ok(correctiveActionService.getOverdueCorrectiveActions());
    }

    @GetMapping("/api/findings/{findingId}/corrective-actions/{id}")
    public ResponseEntity<CorrectiveActionResponse> getCorrectiveActionByIdForFinding(
            @PathVariable Long findingId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(correctiveActionService.getCorrectiveActionById(id));
    }

    @GetMapping("/api/corrective-actions/{id}")
    public ResponseEntity<CorrectiveActionResponse> getCorrectiveActionById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(correctiveActionService.getCorrectiveActionById(id));
    }

    @PutMapping("/api/corrective-actions/{id}")
    public ResponseEntity<CorrectiveActionResponse> updateCorrectiveAction(
            @PathVariable Long id,
            @RequestBody CorrectiveActionRequest request
    ) {
        return ResponseEntity.ok(correctiveActionService.updateCorrectiveAction(id, request));
    }

    @PutMapping("/api/findings/{findingId}/corrective-actions/{id}")
    public ResponseEntity<CorrectiveActionResponse> updateCorrectiveActionForFinding(
            @PathVariable Long findingId,
            @PathVariable Long id,
            @RequestBody CorrectiveActionRequest request
    ) {
        return ResponseEntity.ok(correctiveActionService.updateCorrectiveAction(id, request));
    }

    @PatchMapping("/api/corrective-actions/{id}/status")
    public ResponseEntity<CorrectiveActionResponse> updateStatus(
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
        CorrectiveActionStatus newStatus;
        try {
            newStatus = CorrectiveActionStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + statusStr);
        }
        return ResponseEntity.ok(correctiveActionService.updateStatus(id, newStatus));
    }
}
