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
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getDashboardSummary_ReturnsCalculatedMetrics() {
        when(jdbcTemplate.queryForObject(contains("Audit"), eq(Long.class))).thenReturn(10L);
        when(jdbcTemplate.queryForObject(contains("PLANNED"), eq(Long.class))).thenReturn(4L);
        when(jdbcTemplate.queryForObject(contains("IN_PROGRESS"), eq(Long.class))).thenReturn(3L);
        when(jdbcTemplate.queryForObject(contains("Finding"), eq(Long.class))).thenReturn(15L);
        when(jdbcTemplate.queryForObject(contains("CRITICAL"), eq(Long.class))).thenReturn(2L);
        when(jdbcTemplate.queryForObject(contains("CorrectiveAction"), eq(Long.class))).thenReturn(8L);
        when(jdbcTemplate.queryForObject(contains("NOW()"), eq(Long.class))).thenReturn(1L);
        when(jdbcTemplate.queryForObject(contains("Verification"), eq(Long.class))).thenReturn(5L);
        when(jdbcTemplate.queryForObject(contains("APPROVED"), eq(Long.class))).thenReturn(3L);

        DashboardResponse summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(10L, summary.getTotalAudits());
        assertEquals(4L, summary.getPlannedAudits());
        assertEquals(3L, summary.getInProgressAudits());
        assertEquals(15L, summary.getTotalFindings());
        assertEquals(2L, summary.getCriticalFindings());
        assertEquals(8L, summary.getTotalCorrectiveActions());
        assertEquals(1L, summary.getOverdueCorrectiveActions());
        assertEquals(5L, summary.getTotalVerifications());
        assertEquals(3L, summary.getApprovedVerifications());
    }

    @Test
    void getDashboardSummary_HandlesNullCountFromDatabase() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class))).thenReturn(null);

        DashboardResponse summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(0L, summary.getTotalAudits());
        assertEquals(0L, summary.getPlannedAudits());
        assertEquals(0L, summary.getTotalFindings());
        assertEquals(0L, summary.getCriticalFindings());
        assertEquals(0L, summary.getTotalCorrectiveActions());
        assertEquals(0L, summary.getOverdueCorrectiveActions());
        assertEquals(0L, summary.getTotalVerifications());
    }
}
