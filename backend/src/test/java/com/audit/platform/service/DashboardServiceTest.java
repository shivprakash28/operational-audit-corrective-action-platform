package com.audit.platform.service;

import com.audit.platform.dto.DashboardResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class))).thenReturn(5L);
    }

    @Test
    void getDashboardSummary_Success() {
        DashboardResponse summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(5L, summary.getTotalAudits());
        assertEquals(5L, summary.getPlannedAudits());
        assertEquals(5L, summary.getTotalFindings());
        assertEquals(5L, summary.getCriticalFindings());
        assertEquals(5L, summary.getTotalCorrectiveActions());
        assertEquals(5L, summary.getTotalVerifications());
    }
}
