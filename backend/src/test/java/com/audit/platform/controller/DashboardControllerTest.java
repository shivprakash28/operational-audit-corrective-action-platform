package com.audit.platform.controller;

import com.audit.platform.dto.DashboardResponse;
import com.audit.platform.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardController dashboardController;

    private DashboardResponse sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dashboardController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleResponse = new DashboardResponse();
        sampleResponse.setTotalAudits(10);
        sampleResponse.setPlannedAudits(4);
        sampleResponse.setInProgressAudits(6);
        sampleResponse.setTotalFindings(15);
        sampleResponse.setCriticalFindings(2);
        sampleResponse.setTotalCorrectiveActions(12);
        sampleResponse.setTotalVerifications(8);
    }

    @Test
    void getDashboardSummary_Success() throws Exception {
        when(dashboardService.getDashboardSummary()).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAudits").value(10))
                .andExpect(jsonPath("$.plannedAudits").value(4))
                .andExpect(jsonPath("$.totalFindings").value(15))
                .andExpect(jsonPath("$.criticalFindings").value(2))
                .andExpect(jsonPath("$.totalCorrectiveActions").value(12))
                .andExpect(jsonPath("$.totalVerifications").value(8));
    }
}
