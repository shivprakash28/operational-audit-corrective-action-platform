package com.audit.platform.controller;

import com.audit.platform.dto.EvidenceResponse;
import com.audit.platform.entity.Evidence;
import com.audit.platform.service.EvidenceService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping(value = "/api/corrective-actions/{correctiveActionId}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EvidenceResponse> uploadEvidenceForCorrectiveAction(
            @PathVariable Long correctiveActionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedById", required = false) Long uploadedById
    ) {
        EvidenceResponse response = evidenceService.uploadEvidence(correctiveActionId, uploadedById, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/api/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EvidenceResponse> uploadEvidenceDirect(
            @RequestParam("correctiveActionId") Long correctiveActionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedById", required = false) Long uploadedById
    ) {
        EvidenceResponse response = evidenceService.uploadEvidence(correctiveActionId, uploadedById, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/corrective-actions/{correctiveActionId}/evidence")
    public ResponseEntity<List<EvidenceResponse>> getEvidenceByCorrectiveActionId(
            @PathVariable Long correctiveActionId
    ) {
        return ResponseEntity.ok(evidenceService.getEvidenceByCorrectiveActionId(correctiveActionId));
    }

    @GetMapping("/api/evidence")
    public ResponseEntity<List<EvidenceResponse>> getAllEvidence() {
        return ResponseEntity.ok(evidenceService.getAllEvidence());
    }

    @GetMapping("/api/evidence/{id}")
    public ResponseEntity<EvidenceResponse> getEvidenceById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(evidenceService.getEvidenceById(id));
    }

    @GetMapping("/api/evidence/{id}/download")
    public ResponseEntity<Resource> downloadEvidence(
            @PathVariable Long id
    ) {
        Evidence evidence = evidenceService.getEvidenceEntityById(id);
        Resource resource = evidenceService.loadEvidenceFileAsResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + evidence.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/api/corrective-actions/{correctiveActionId}/evidence/{id}/download")
    public ResponseEntity<Resource> downloadEvidenceForCorrectiveAction(
            @PathVariable Long correctiveActionId,
            @PathVariable Long id
    ) {
        return downloadEvidence(id);
    }
}
