package com.audit.platform.service;

import com.audit.platform.dto.AssignChecklistRequest;
import com.audit.platform.dto.AuditChecklistResponse;
import com.audit.platform.dto.ChecklistResponseDto;
import com.audit.platform.dto.ChecklistResponseRequest;
import com.audit.platform.entity.*;
import com.audit.platform.repository.AuditChecklistRepository;
import com.audit.platform.repository.AuditRepository;
import com.audit.platform.repository.ChecklistItemRepository;
import com.audit.platform.repository.ChecklistResponseRepository;
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
class AuditChecklistServiceTest {

    @Mock
    private AuditRepository auditRepository;

    @Mock
    private ChecklistTemplateRepository checklistTemplateRepository;

    @Mock
    private ChecklistItemRepository checklistItemRepository;

    @Mock
    private AuditChecklistRepository auditChecklistRepository;

    @Mock
    private ChecklistResponseRepository checklistResponseRepository;

    @InjectMocks
    private AuditChecklistService auditChecklistService;

    private Audit audit;
    private ChecklistTemplate template1;
    private ChecklistTemplate template2;
    private ChecklistItem itemTemplate1;
    private ChecklistItem itemTemplate2;
    private AuditChecklist auditChecklist;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        audit = new Audit();
        audit.setId(10L);
        audit.setTitle("Operations Process Audit");

        template1 = new ChecklistTemplate();
        template1.setId(1L);
        template1.setName("Operations Checklist");

        template2 = new ChecklistTemplate();
        template2.setId(2L);
        template2.setName("Security Checklist");

        itemTemplate1 = new ChecklistItem();
        itemTemplate1.setId(100L);
        itemTemplate1.setTemplate(template1);
        itemTemplate1.setQuestion("Are procedures documented?");
        itemTemplate1.setOrder(1);

        itemTemplate2 = new ChecklistItem();
        itemTemplate2.setId(200L);
        itemTemplate2.setTemplate(template2);
        itemTemplate2.setQuestion("Is MFA enabled?");
        itemTemplate2.setOrder(1);

        auditChecklist = new AuditChecklist();
        auditChecklist.setId(50L);
        auditChecklist.setAudit(audit);
        auditChecklist.setTemplate(template1);
        auditChecklist.setAssignedAt(now);
    }

    @Test
    void assignChecklist_success() {
        AssignChecklistRequest req = new AssignChecklistRequest(1L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistTemplateRepository.findById(1L)).thenReturn(Optional.of(template1));
        when(auditChecklistRepository.existsByAuditIdAndTemplateId(10L, 1L)).thenReturn(false);
        when(auditChecklistRepository.save(any(AuditChecklist.class))).thenAnswer(inv -> {
            AuditChecklist ac = inv.getArgument(0);
            ac.setId(50L);
            return ac;
        });

        AuditChecklistResponse res = auditChecklistService.assignChecklist(10L, req);

        assertNotNull(res);
        assertEquals(50L, res.getId());
        assertEquals(10L, res.getAuditId());
        assertEquals(1L, res.getTemplateId());
        assertEquals("Operations Checklist", res.getTemplateName());
        assertNotNull(res.getAssignedAt());
        verify(auditChecklistRepository).save(any(AuditChecklist.class));
    }

    @Test
    void assignChecklist_invalidAudit_throwsNoSuchElementException() {
        AssignChecklistRequest req = new AssignChecklistRequest(1L);
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> auditChecklistService.assignChecklist(999L, req));
        verify(auditChecklistRepository, never()).save(any());
    }

    @Test
    void assignChecklist_invalidTemplate_throwsIllegalArgumentException() {
        AssignChecklistRequest req = new AssignChecklistRequest(999L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistTemplateRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> auditChecklistService.assignChecklist(10L, req));
        verify(auditChecklistRepository, never()).save(any());
    }

    @Test
    void assignChecklist_duplicateAssignment_throwsIllegalArgumentException() {
        AssignChecklistRequest req = new AssignChecklistRequest(1L);
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(checklistTemplateRepository.findById(1L)).thenReturn(Optional.of(template1));
        when(auditChecklistRepository.existsByAuditIdAndTemplateId(10L, 1L)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditChecklistService.assignChecklist(10L, req)
        );
        assertTrue(ex.getMessage().contains("already assigned"));
        verify(auditChecklistRepository, never()).save(any());
    }

    @Test
    void getAuditChecklists_success() {
        when(auditRepository.existsById(10L)).thenReturn(true);
        when(auditChecklistRepository.findByAuditId(10L)).thenReturn(List.of(auditChecklist));

        List<AuditChecklistResponse> list = auditChecklistService.getAuditChecklists(10L);

        assertEquals(1, list.size());
        assertEquals(50L, list.get(0).getId());
        assertEquals("Operations Checklist", list.get(0).getTemplateName());
    }

    @Test
    void getAuditChecklists_invalidAudit_throwsNoSuchElementException() {
        when(auditRepository.existsById(999L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> auditChecklistService.getAuditChecklists(999L));
    }

    @Test
    void submitResponse_compliant_success() {
        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.COMPLIANT, "Fully verified");

        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistItemRepository.findById(100L)).thenReturn(Optional.of(itemTemplate1));
        when(checklistResponseRepository.findByAuditChecklistIdAndChecklistItemId(50L, 100L)).thenReturn(Optional.empty());
        when(checklistResponseRepository.save(any(ChecklistResponse.class))).thenAnswer(inv -> {
            ChecklistResponse r = inv.getArgument(0);
            r.setId(1000L);
            return r;
        });

        ChecklistResponseDto res = auditChecklistService.submitResponse(10L, 50L, req);

        assertNotNull(res);
        assertEquals(1000L, res.getId());
        assertEquals(50L, res.getAuditChecklistId());
        assertEquals(100L, res.getChecklistItemId());
        assertEquals(ChecklistResponseStatus.COMPLIANT, res.getStatus());
        assertEquals("Fully verified", res.getRemarks());
        assertNotNull(res.getRespondedAt());
    }

    @Test
    void submitResponse_nonCompliant_success() {
        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.NON_COMPLIANT, "Missing SOP documentation");

        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistItemRepository.findById(100L)).thenReturn(Optional.of(itemTemplate1));
        when(checklistResponseRepository.findByAuditChecklistIdAndChecklistItemId(50L, 100L)).thenReturn(Optional.empty());
        when(checklistResponseRepository.save(any(ChecklistResponse.class))).thenAnswer(inv -> {
            ChecklistResponse r = inv.getArgument(0);
            r.setId(1001L);
            return r;
        });

        ChecklistResponseDto res = auditChecklistService.submitResponse(10L, 50L, req);

        assertNotNull(res);
        assertEquals(ChecklistResponseStatus.NON_COMPLIANT, res.getStatus());
        assertEquals("Missing SOP documentation", res.getRemarks());
    }

    @Test
    void submitResponse_na_success() {
        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.NA, "Not applicable for this unit");

        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistItemRepository.findById(100L)).thenReturn(Optional.of(itemTemplate1));
        when(checklistResponseRepository.findByAuditChecklistIdAndChecklistItemId(50L, 100L)).thenReturn(Optional.empty());
        when(checklistResponseRepository.save(any(ChecklistResponse.class))).thenAnswer(inv -> {
            ChecklistResponse r = inv.getArgument(0);
            r.setId(1002L);
            return r;
        });

        ChecklistResponseDto res = auditChecklistService.submitResponse(10L, 50L, req);

        assertNotNull(res);
        assertEquals(ChecklistResponseStatus.NA, res.getStatus());
        assertEquals("Not applicable for this unit", res.getRemarks());
    }

    @Test
    void submitResponse_invalidAudit_throwsNoSuchElementException() {
        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.COMPLIANT, "ok");
        when(auditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> auditChecklistService.submitResponse(999L, 50L, req));
    }

    @Test
    void submitResponse_invalidAuditChecklist_throwsNoSuchElementException() {
        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.COMPLIANT, "ok");
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> auditChecklistService.submitResponse(10L, 999L, req));
    }

    @Test
    void submitResponse_invalidChecklistItem_throwsIllegalArgumentException() {
        ChecklistResponseRequest req = new ChecklistResponseRequest(999L, ChecklistResponseStatus.COMPLIANT, "ok");
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> auditChecklistService.submitResponse(10L, 50L, req));
    }

    @Test
    void submitResponse_invalidRelationship_itemNotFromTemplate_throwsIllegalArgumentException() {
        // itemTemplate2 belongs to template2, while auditChecklist is for template1
        ChecklistResponseRequest req = new ChecklistResponseRequest(200L, ChecklistResponseStatus.COMPLIANT, "ok");
        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistItemRepository.findById(200L)).thenReturn(Optional.of(itemTemplate2));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> auditChecklistService.submitResponse(10L, 50L, req)
        );
        assertTrue(ex.getMessage().contains("does not belong to template"));
    }

    @Test
    void submitResponse_updateExistingResponse_success() {
        ChecklistResponse existing = new ChecklistResponse();
        existing.setId(500L);
        existing.setAuditChecklist(auditChecklist);
        existing.setChecklistItem(itemTemplate1);
        existing.setStatus(ChecklistResponseStatus.NON_COMPLIANT);
        existing.setRemarks("Old remarks");

        ChecklistResponseRequest req = new ChecklistResponseRequest(100L, ChecklistResponseStatus.COMPLIANT, "Updated remarks");

        when(auditRepository.findById(10L)).thenReturn(Optional.of(audit));
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistItemRepository.findById(100L)).thenReturn(Optional.of(itemTemplate1));
        when(checklistResponseRepository.findByAuditChecklistIdAndChecklistItemId(50L, 100L)).thenReturn(Optional.of(existing));
        when(checklistResponseRepository.save(any(ChecklistResponse.class))).thenAnswer(inv -> inv.getArgument(0));

        ChecklistResponseDto res = auditChecklistService.submitResponse(10L, 50L, req);

        assertNotNull(res);
        assertEquals(500L, res.getId());
        assertEquals(ChecklistResponseStatus.COMPLIANT, res.getStatus());
        assertEquals("Updated remarks", res.getRemarks());
    }

    @Test
    void getResponses_success() {
        ChecklistResponse r = new ChecklistResponse();
        r.setId(500L);
        r.setAuditChecklist(auditChecklist);
        r.setChecklistItem(itemTemplate1);
        r.setStatus(ChecklistResponseStatus.COMPLIANT);
        r.setRemarks("Checked");
        r.setRespondedAt(LocalDateTime.now());

        when(auditRepository.existsById(10L)).thenReturn(true);
        when(auditChecklistRepository.findById(50L)).thenReturn(Optional.of(auditChecklist));
        when(checklistResponseRepository.findByAuditChecklistId(50L)).thenReturn(List.of(r));

        List<ChecklistResponseDto> responses = auditChecklistService.getResponses(10L, 50L);

        assertEquals(1, responses.size());
        assertEquals(500L, responses.get(0).getId());
        assertEquals(ChecklistResponseStatus.COMPLIANT, responses.get(0).getStatus());
        assertEquals("Are procedures documented?", responses.get(0).getQuestion());
    }
}
