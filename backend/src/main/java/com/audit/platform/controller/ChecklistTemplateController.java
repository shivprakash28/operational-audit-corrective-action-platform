package com.audit.platform.controller;

import com.audit.platform.dto.ChecklistItemRequest;
import com.audit.platform.dto.ChecklistItemResponse;
import com.audit.platform.dto.ChecklistTemplateRequest;
import com.audit.platform.dto.ChecklistTemplateResponse;
import com.audit.platform.service.ChecklistTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist-templates")
public class ChecklistTemplateController {

    private final ChecklistTemplateService checklistTemplateService;

    public ChecklistTemplateController(ChecklistTemplateService checklistTemplateService) {
        this.checklistTemplateService = checklistTemplateService;
    }

    @PostMapping
    public ResponseEntity<ChecklistTemplateResponse> createTemplate(
            @Valid @RequestBody ChecklistTemplateRequest request
    ) {
        ChecklistTemplateResponse response = checklistTemplateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ChecklistTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(checklistTemplateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChecklistTemplateResponse> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(checklistTemplateService.getTemplateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChecklistTemplateResponse> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody ChecklistTemplateRequest request
    ) {
        return ResponseEntity.ok(checklistTemplateService.updateTemplate(id, request));
    }

    @PostMapping("/{templateId}/items")
    public ResponseEntity<ChecklistItemResponse> addItem(
            @PathVariable Long templateId,
            @Valid @RequestBody ChecklistItemRequest request
    ) {
        ChecklistItemResponse response = checklistTemplateService.addItem(templateId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{templateId}/items")
    public ResponseEntity<List<ChecklistItemResponse>> getItems(@PathVariable Long templateId) {
        return ResponseEntity.ok(checklistTemplateService.getItems(templateId));
    }
}
