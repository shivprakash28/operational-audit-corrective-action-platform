package com.audit.platform.controller;

import com.audit.platform.dto.VerificationRequest;
import com.audit.platform.dto.VerificationResponse;
import com.audit.platform.entity.VerificationStatus;
import com.audit.platform.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/api/corrective-actions/{correctiveActionId}/verifications")
    public ResponseEntity<VerificationResponse> createVerificationForCorrectiveAction(
            @PathVariable Long correctiveActionId,
            @Valid @RequestBody VerificationRequest request
    ) {
        VerificationResponse response = verificationService.createVerification(correctiveActionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/api/verifications")
    public ResponseEntity<VerificationResponse> createVerificationDirect(
            @Valid @RequestBody VerificationRequest request
    ) {
        Long correctiveActionId = request.getCorrectiveActionId();
        if (correctiveActionId == null) {
            throw new IllegalArgumentException("Corrective Action ID is required");
        }
        VerificationResponse response = verificationService.createVerification(correctiveActionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/corrective-actions/{correctiveActionId}/verifications")
    public ResponseEntity<List<VerificationResponse>> getVerificationsByCorrectiveActionId(
            @PathVariable Long correctiveActionId
    ) {
        return ResponseEntity.ok(verificationService.getVerificationsByCorrectiveActionId(correctiveActionId));
    }

    @GetMapping("/api/verifications")
    public ResponseEntity<List<VerificationResponse>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    @GetMapping("/api/corrective-actions/{correctiveActionId}/verifications/{id}")
    public ResponseEntity<VerificationResponse> getVerificationByIdForCorrectiveAction(
            @PathVariable Long correctiveActionId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(verificationService.getVerificationById(id));
    }

    @GetMapping("/api/verifications/{id}")
    public ResponseEntity<VerificationResponse> getVerificationById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(verificationService.getVerificationById(id));
    }

    @RequestMapping(value = "/api/verifications/{id}/approve", method = {RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<VerificationResponse> approveVerification(
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String finalComments = comments;
        if ((finalComments == null || finalComments.isBlank()) && payload != null) {
            finalComments = payload.get("comments");
        }
        return ResponseEntity.ok(verificationService.approveVerification(id, finalComments));
    }

    @RequestMapping(value = "/api/verifications/{id}/reject", method = {RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<VerificationResponse> rejectVerification(
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String finalComments = comments;
        if ((finalComments == null || finalComments.isBlank()) && payload != null) {
            finalComments = payload.get("comments");
        }
        return ResponseEntity.ok(verificationService.rejectVerification(id, finalComments));
    }

    @PatchMapping("/api/verifications/{id}/status")
    public ResponseEntity<VerificationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String statusStr = status;
        String commentsStr = null;
        if (payload != null) {
            if (statusStr == null || statusStr.isBlank()) {
                statusStr = payload.get("status");
            }
            commentsStr = payload.get("comments");
        }
        if (statusStr == null || statusStr.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        VerificationStatus verificationStatus;
        try {
            verificationStatus = VerificationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + statusStr);
        }
        return ResponseEntity.ok(verificationService.updateStatus(id, verificationStatus, commentsStr));
    }
}
