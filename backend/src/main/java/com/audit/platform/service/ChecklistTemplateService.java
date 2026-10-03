package com.audit.platform.service;

import com.audit.platform.dto.ChecklistItemRequest;
import com.audit.platform.dto.ChecklistItemResponse;
import com.audit.platform.dto.ChecklistTemplateRequest;
import com.audit.platform.dto.ChecklistTemplateResponse;
import com.audit.platform.entity.ChecklistItem;
import com.audit.platform.entity.ChecklistTemplate;
import com.audit.platform.repository.ChecklistItemRepository;
import com.audit.platform.repository.ChecklistTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChecklistTemplateService {

    private final ChecklistTemplateRepository checklistTemplateRepository;
    private final ChecklistItemRepository checklistItemRepository;

    public ChecklistTemplateService(ChecklistTemplateRepository checklistTemplateRepository,
                                  ChecklistItemRepository checklistItemRepository) {
        this.checklistTemplateRepository = checklistTemplateRepository;
        this.checklistItemRepository = checklistItemRepository;
    }

    public ChecklistTemplateResponse createTemplate(ChecklistTemplateRequest request) {
        if (request == null || request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Template name is required");
        }

        LocalDateTime now = LocalDateTime.now();
        ChecklistTemplate template = new ChecklistTemplate();
        template.setName(request.getName().trim());
        template.setDescription(request.getDescription());
        template.setCreatedAt(now);
        template.setUpdatedAt(now);

        ChecklistTemplate saved = checklistTemplateRepository.save(template);
        return mapToResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public List<ChecklistTemplateResponse> getAllTemplates() {
        return checklistTemplateRepository.findAll().stream()
                .map(t -> mapToResponse(t, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChecklistTemplateResponse getTemplateById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Template ID must not be null");
        }
        ChecklistTemplate template = checklistTemplateRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Checklist template not found with id: " + id));

        return mapToResponse(template, true);
    }

    public ChecklistTemplateResponse updateTemplate(Long id, ChecklistTemplateRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Template ID must not be null");
        }
        if (request == null || request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Template name is required");
        }

        ChecklistTemplate template = checklistTemplateRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Checklist template not found with id: " + id));

        template.setName(request.getName().trim());
        template.setDescription(request.getDescription());
        template.setUpdatedAt(LocalDateTime.now());

        ChecklistTemplate saved = checklistTemplateRepository.save(template);
        return mapToResponse(saved, true);
    }

    public ChecklistItemResponse addItem(Long templateId, ChecklistItemRequest request) {
        if (templateId == null) {
            throw new IllegalArgumentException("Template ID must not be null");
        }
        if (request == null || request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
            throw new IllegalArgumentException("Question is required");
        }

        ChecklistTemplate template = checklistTemplateRepository.findById(templateId)
                .orElseThrow(() -> new NoSuchElementException("Checklist template not found with id: " + templateId));

        int itemOrder = request.getOrder() != null ? request.getOrder() : getNextOrder(templateId);

        ChecklistItem item = new ChecklistItem();
        item.setTemplate(template);
        item.setQuestion(request.getQuestion().trim());
        item.setDescription(request.getDescription());
        item.setOrder(itemOrder);

        ChecklistItem saved = checklistItemRepository.save(item);
        return mapItemToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getItems(Long templateId) {
        if (templateId == null) {
            throw new IllegalArgumentException("Template ID must not be null");
        }
        if (!checklistTemplateRepository.existsById(templateId)) {
            throw new NoSuchElementException("Checklist template not found with id: " + templateId);
        }

        return checklistItemRepository.findByTemplateIdOrderByOrderAsc(templateId).stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
    }

    private int getNextOrder(Long templateId) {
        return checklistItemRepository.findTopByTemplateIdOrderByOrderDesc(templateId)
                .map(i -> i.getOrder() + 1)
                .orElse(1);
    }

    private ChecklistTemplateResponse mapToResponse(ChecklistTemplate template, boolean includeItems) {
        ChecklistTemplateResponse response = new ChecklistTemplateResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );

        if (includeItems) {
            List<ChecklistItemResponse> items = checklistItemRepository.findByTemplateIdOrderByOrderAsc(template.getId())
                    .stream()
                    .map(this::mapItemToResponse)
                    .collect(Collectors.toList());
            response.setItems(items);
        }

        return response;
    }

    private ChecklistItemResponse mapItemToResponse(ChecklistItem item) {
        return new ChecklistItemResponse(
                item.getId(),
                item.getTemplate() != null ? item.getTemplate().getId() : null,
                item.getQuestion(),
                item.getDescription(),
                item.getOrder()
        );
    }
}
