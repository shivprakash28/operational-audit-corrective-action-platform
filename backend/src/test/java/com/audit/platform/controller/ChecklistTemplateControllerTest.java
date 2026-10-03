package com.audit.platform.controller;

import com.audit.platform.dto.ChecklistItemRequest;
import com.audit.platform.dto.ChecklistItemResponse;
import com.audit.platform.dto.ChecklistTemplateRequest;
import com.audit.platform.dto.ChecklistTemplateResponse;
import com.audit.platform.service.ChecklistTemplateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ChecklistTemplateControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ChecklistTemplateService checklistTemplateService;

    @InjectMocks
    private ChecklistTemplateController checklistTemplateController;

    private ObjectMapper objectMapper;
    private ChecklistTemplateResponse sampleTemplateResponse;
    private ChecklistItemResponse sampleItemResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(checklistTemplateController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalDateTime now = LocalDateTime.now();
        sampleTemplateResponse = new ChecklistTemplateResponse(1L, "Operational Template", "Review Operations", now, now);
        sampleItemResponse = new ChecklistItemResponse(10L, 1L, "Are procedures documented?", "Documentation check", 1);
    }

    @Test
    void createTemplate_success_returns201() throws Exception {
        when(checklistTemplateService.createTemplate(any(ChecklistTemplateRequest.class)))
                .thenReturn(sampleTemplateResponse);

        ChecklistTemplateRequest req = new ChecklistTemplateRequest("Operational Template", "Review Operations");

        mockMvc.perform(post("/api/checklist-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Operational Template"));
    }

    @Test
    void createTemplate_blankName_returns400() throws Exception {
        ChecklistTemplateRequest req = new ChecklistTemplateRequest("", "Desc");

        mockMvc.perform(post("/api/checklist-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void getAllTemplates_returns200() throws Exception {
        when(checklistTemplateService.getAllTemplates()).thenReturn(List.of(sampleTemplateResponse));

        mockMvc.perform(get("/api/checklist-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Operational Template"));
    }

    @Test
    void getTemplateById_existing_returns200() throws Exception {
        when(checklistTemplateService.getTemplateById(1L)).thenReturn(sampleTemplateResponse);

        mockMvc.perform(get("/api/checklist-templates/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void getTemplateById_nonExisting_returns404() throws Exception {
        when(checklistTemplateService.getTemplateById(999L))
                .thenThrow(new NoSuchElementException("Checklist template not found with id: 999"));

        mockMvc.perform(get("/api/checklist-templates/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Checklist template not found with id: 999"));
    }

    @Test
    void updateTemplate_existing_returns200() throws Exception {
        when(checklistTemplateService.updateTemplate(eq(1L), any(ChecklistTemplateRequest.class)))
                .thenReturn(sampleTemplateResponse);

        ChecklistTemplateRequest req = new ChecklistTemplateRequest("Operational Template", "Updated");

        mockMvc.perform(put("/api/checklist-templates/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void addItem_success_returns201() throws Exception {
        when(checklistTemplateService.addItem(eq(1L), any(ChecklistItemRequest.class)))
                .thenReturn(sampleItemResponse);

        ChecklistItemRequest req = new ChecklistItemRequest("Are procedures documented?", "Documentation check", 1);

        mockMvc.perform(post("/api/checklist-templates/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.question").value("Are procedures documented?"))
                .andExpect(jsonPath("$.order").value(1));
    }

    @Test
    void addItem_blankQuestion_returns400() throws Exception {
        ChecklistItemRequest req = new ChecklistItemRequest("", "Desc", 1);

        mockMvc.perform(post("/api/checklist-templates/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.question").exists());
    }

    @Test
    void getItems_returns200() throws Exception {
        when(checklistTemplateService.getItems(1L)).thenReturn(List.of(sampleItemResponse));

        mockMvc.perform(get("/api/checklist-templates/1/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[0].order").value(1));
    }
}
