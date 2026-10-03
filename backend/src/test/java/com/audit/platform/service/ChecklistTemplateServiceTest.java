package com.audit.platform.service;

import com.audit.platform.dto.ChecklistItemRequest;
import com.audit.platform.dto.ChecklistItemResponse;
import com.audit.platform.dto.ChecklistTemplateRequest;
import com.audit.platform.dto.ChecklistTemplateResponse;
import com.audit.platform.entity.ChecklistItem;
import com.audit.platform.entity.ChecklistTemplate;
import com.audit.platform.repository.ChecklistItemRepository;
import com.audit.platform.repository.ChecklistTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChecklistTemplateServiceTest {

    @Mock
    private ChecklistTemplateRepository checklistTemplateRepository;

    @Mock
    private ChecklistItemRepository checklistItemRepository;

    @InjectMocks
    private ChecklistTemplateService checklistTemplateService;

    private ChecklistTemplate template;
    private ChecklistItem item1;
    private ChecklistItem item2;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();
        template = new ChecklistTemplate();
        template.setId(1L);
        template.setName("ISO 9001 Audit Checklist");
        template.setDescription("Quality Management System Checklist");
        template.setCreatedAt(now);
        template.setUpdatedAt(now);

        item1 = new ChecklistItem();
        item1.setId(10L);
        item1.setTemplate(template);
        item1.setQuestion("Is quality policy established?");
        item1.setDescription("Check documentation");
        item1.setOrder(1);

        item2 = new ChecklistItem();
        item2.setId(20L);
        item2.setTemplate(template);
        item2.setQuestion("Are objectives measurable?");
        item2.setDescription("Check KPIs");
        item2.setOrder(2);
    }

    @Test
    void createTemplate_validRequest_success() {
        ChecklistTemplateRequest req = new ChecklistTemplateRequest("Safety Checklist", "Workplace safety");
        when(checklistTemplateRepository.save(any(ChecklistTemplate.class))).thenAnswer(inv -> {
            ChecklistTemplate t = inv.getArgument(0);
            t.setId(2L);
            return t;
        });

        ChecklistTemplateResponse res = checklistTemplateService.createTemplate(req);

        assertNotNull(res);
        assertEquals(2L, res.getId());
        assertEquals("Safety Checklist", res.getName());
        assertEquals("Workplace safety", res.getDescription());
        assertNotNull(res.getCreatedAt());
        verify(checklistTemplateRepository).save(any(ChecklistTemplate.class));
    }

    @Test
    void createTemplate_blankName_throwsIllegalArgumentException() {
        ChecklistTemplateRequest req = new ChecklistTemplateRequest("   ", "Desc");

        assertThrows(IllegalArgumentException.class, () -> checklistTemplateService.createTemplate(req));
        verify(checklistTemplateRepository, never()).save(any());
    }

    @Test
    void getAllTemplates_returnsList() {
        when(checklistTemplateRepository.findAll()).thenReturn(List.of(template));

        List<ChecklistTemplateResponse> res = checklistTemplateService.getAllTemplates();

        assertEquals(1, res.size());
        assertEquals(1L, res.get(0).getId());
        assertEquals("ISO 9001 Audit Checklist", res.get(0).getName());
    }

    @Test
    void getTemplateById_existingId_returnsTemplateWithItems() {
        when(checklistTemplateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(checklistItemRepository.findByTemplateIdOrderByOrderAsc(1L)).thenReturn(List.of(item1, item2));

        ChecklistTemplateResponse res = checklistTemplateService.getTemplateById(1L);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals(2, res.getItems().size());
        assertEquals("Is quality policy established?", res.getItems().get(0).getQuestion());
        assertEquals(1, res.getItems().get(0).getOrder());
    }

    @Test
    void getTemplateById_nonExistingId_throwsNoSuchElementException() {
        when(checklistTemplateRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> checklistTemplateService.getTemplateById(999L));
    }

    @Test
    void updateTemplate_existingId_updatesSuccessfully() {
        when(checklistTemplateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(checklistTemplateRepository.save(any(ChecklistTemplate.class))).thenAnswer(inv -> inv.getArgument(0));

        ChecklistTemplateRequest req = new ChecklistTemplateRequest("Updated Name", "Updated Desc");
        ChecklistTemplateResponse res = checklistTemplateService.updateTemplate(1L, req);

        assertEquals("Updated Name", res.getName());
        assertEquals("Updated Desc", res.getDescription());
    }

    @Test
    void updateTemplate_nonExistingId_throwsNoSuchElementException() {
        when(checklistTemplateRepository.findById(999L)).thenReturn(Optional.empty());

        ChecklistTemplateRequest req = new ChecklistTemplateRequest("Updated Name", "Updated Desc");
        assertThrows(NoSuchElementException.class, () -> checklistTemplateService.updateTemplate(999L, req));
    }

    @Test
    void addItem_validRequest_success() {
        when(checklistTemplateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(checklistItemRepository.save(any(ChecklistItem.class))).thenAnswer(inv -> {
            ChecklistItem i = inv.getArgument(0);
            i.setId(30L);
            return i;
        });

        ChecklistItemRequest req = new ChecklistItemRequest("Are audits scheduled?", "Audit schedule check", 3);
        ChecklistItemResponse res = checklistTemplateService.addItem(1L, req);

        assertNotNull(res);
        assertEquals(30L, res.getId());
        assertEquals(1L, res.getTemplateId());
        assertEquals("Are audits scheduled?", res.getQuestion());
        assertEquals(3, res.getOrder());
    }

    @Test
    void addItem_templateNotFound_throwsNoSuchElementException() {
        when(checklistTemplateRepository.findById(999L)).thenReturn(Optional.empty());

        ChecklistItemRequest req = new ChecklistItemRequest("Question?", "Desc", 1);
        assertThrows(NoSuchElementException.class, () -> checklistTemplateService.addItem(999L, req));
    }

    @Test
    void addItem_blankQuestion_throwsIllegalArgumentException() {
        ChecklistItemRequest req = new ChecklistItemRequest("  ", "Desc", 1);

        assertThrows(IllegalArgumentException.class, () -> checklistTemplateService.addItem(1L, req));
    }

    @Test
    void getItems_existingTemplate_returnsOrderedList() {
        when(checklistTemplateRepository.existsById(1L)).thenReturn(true);
        when(checklistItemRepository.findByTemplateIdOrderByOrderAsc(1L)).thenReturn(List.of(item1, item2));

        List<ChecklistItemResponse> items = checklistTemplateService.getItems(1L);

        assertEquals(2, items.size());
        assertEquals(1, items.get(0).getOrder());
        assertEquals(2, items.get(1).getOrder());
    }

    @Test
    void getItems_nonExistingTemplate_throwsNoSuchElementException() {
        when(checklistTemplateRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> checklistTemplateService.getItems(999L));
    }
}
