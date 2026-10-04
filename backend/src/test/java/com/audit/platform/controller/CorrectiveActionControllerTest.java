package com.audit.platform.controller;

import com.audit.platform.dto.CorrectiveActionRequest;
import com.audit.platform.dto.CorrectiveActionResponse;
import com.audit.platform.entity.CorrectiveActionStatus;
import com.audit.platform.service.CorrectiveActionService;
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
import java.util.Map;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CorrectiveActionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CorrectiveActionService correctiveActionService;

    @InjectMocks
    private CorrectiveActionController correctiveActionController;

    private ObjectMapper objectMapper;
    private CorrectiveActionResponse testResponse;
    private LocalDateTime testDueDate;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(correctiveActionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        testDueDate = LocalDateTime.of(2026, 10, 20, 12, 0);

        testResponse = new CorrectiveActionResponse();
        testResponse.setId(100L);
        testResponse.setFindingId(10L);
        testResponse.setAuditId(1L);
        testResponse.setTitle("Fix Safety Valve");
        testResponse.setDescription("Replace safety valve within 10 days");
        testResponse.setOwnerId(5L);
        testResponse.setOwnerName("Jane ActionOwner");
        testResponse.setOwnerEmail("jane@example.com");
        testResponse.setDueDate(testDueDate);
        testResponse.setDeadline(testDueDate);
        testResponse.setStatus(CorrectiveActionStatus.OPEN);
        testResponse.setCreatedAt(LocalDateTime.now());
        testResponse.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createCorrectiveActionForFinding_Success() throws Exception {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(10L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve within 10 days");
        request.setOwnerId(5L);
        request.setDueDate(testDueDate);
        request.setStatus(CorrectiveActionStatus.OPEN);

        when(correctiveActionService.createCorrectiveAction(eq(10L), any(CorrectiveActionRequest.class)))
                .thenReturn(testResponse);

        mockMvc.perform(post("/api/findings/10/corrective-actions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.title").value("Fix Safety Valve"))
                .andExpect(jsonPath("$.findingId").value(10L));
    }

    @Test
    void createCorrectiveActionForFinding_InvalidRequest_ReturnsBadRequest() throws Exception {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setTitle(""); // Invalid blank title

        mockMvc.perform(post("/api/findings/10/corrective-actions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCorrectiveActionDirect_Success() throws Exception {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setFindingId(10L);
        request.setTitle("Fix Safety Valve");
        request.setDescription("Replace safety valve within 10 days");
        request.setOwnerId(5L);
        request.setDueDate(testDueDate);

        when(correctiveActionService.createCorrectiveAction(eq(10L), any(CorrectiveActionRequest.class)))
                .thenReturn(testResponse);

        mockMvc.perform(post("/api/corrective-actions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    void getCorrectiveActionsByFindingId_Success() throws Exception {
        when(correctiveActionService.getCorrectiveActionsByFindingId(10L))
                .thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/findings/10/corrective-actions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getAllCorrectiveActions_Success() throws Exception {
        when(correctiveActionService.getAllCorrectiveActions())
                .thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/corrective-actions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getCorrectiveActionById_Success() throws Exception {
        when(correctiveActionService.getCorrectiveActionById(100L))
                .thenReturn(testResponse);

        mockMvc.perform(get("/api/corrective-actions/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    void getCorrectiveActionById_NotFound_ReturnsNotFound() throws Exception {
        when(correctiveActionService.getCorrectiveActionById(999L))
                .thenThrow(new NoSuchElementException("Corrective action not found with id: 999"));

        mockMvc.perform(get("/api/corrective-actions/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCorrectiveAction_Success() throws Exception {
        CorrectiveActionRequest request = new CorrectiveActionRequest();
        request.setTitle("Updated Title");
        request.setDescription("Updated Description");

        when(correctiveActionService.updateCorrectiveAction(eq(100L), any(CorrectiveActionRequest.class)))
                .thenReturn(testResponse);

        mockMvc.perform(put("/api/corrective-actions/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void updateStatus_QueryParam_Success() throws Exception {
        testResponse.setStatus(CorrectiveActionStatus.IN_PROGRESS);
        when(correctiveActionService.updateStatus(100L, CorrectiveActionStatus.IN_PROGRESS))
                .thenReturn(testResponse);

        mockMvc.perform(patch("/api/corrective-actions/100/status?status=IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void updateStatus_BodyParam_Success() throws Exception {
        testResponse.setStatus(CorrectiveActionStatus.COMPLETED);
        when(correctiveActionService.updateStatus(100L, CorrectiveActionStatus.COMPLETED))
                .thenReturn(testResponse);

        mockMvc.perform(patch("/api/corrective-actions/100/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "COMPLETED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void updateStatus_InvalidStatus_ReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/corrective-actions/100/status?status=INVALID_STATUS"))
                .andExpect(status().isBadRequest());
    }
}
