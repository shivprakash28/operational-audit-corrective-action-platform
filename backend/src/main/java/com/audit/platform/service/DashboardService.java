package com.audit.platform.service;

import com.audit.platform.dto.DashboardResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardResponse getDashboardSummary() {
        DashboardResponse summary = new DashboardResponse();

        // Audit metrics
        summary.setTotalAudits(queryCount("SELECT COUNT(*) FROM \"Audit\""));
        summary.setPlannedAudits(queryCount("SELECT COUNT(*) FROM \"Audit\" WHERE CAST(status AS text) = 'PLANNED'"));
        summary.setInProgressAudits(queryCount("SELECT COUNT(*) FROM \"Audit\" WHERE CAST(status AS text) = 'IN_PROGRESS'"));
        summary.setCompletedAudits(queryCount("SELECT COUNT(*) FROM \"Audit\" WHERE CAST(status AS text) = 'COMPLETED'"));
        summary.setClosedAudits(queryCount("SELECT COUNT(*) FROM \"Audit\" WHERE CAST(status AS text) = 'CLOSED'"));

        // Finding metrics
        summary.setTotalFindings(queryCount("SELECT COUNT(*) FROM \"Finding\""));
        summary.setOpenFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(status AS text) = 'OPEN'"));
        summary.setInProgressFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(status AS text) = 'IN_PROGRESS'"));
        summary.setResolvedFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(status AS text) = 'RESOLVED'"));
        summary.setClosedFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(status AS text) = 'CLOSED'"));
        summary.setCriticalFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(severity AS text) = 'CRITICAL'"));
        summary.setMajorFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(severity AS text) = 'MAJOR'"));
        summary.setMinorFindings(queryCount("SELECT COUNT(*) FROM \"Finding\" WHERE CAST(severity AS text) = 'MINOR'"));

        // Corrective Action metrics
        summary.setTotalCorrectiveActions(queryCount("SELECT COUNT(*) FROM \"CorrectiveAction\""));
        summary.setOpenCorrectiveActions(queryCount("SELECT COUNT(*) FROM \"CorrectiveAction\" WHERE CAST(status AS text) = 'OPEN'"));
        summary.setInProgressCorrectiveActions(queryCount("SELECT COUNT(*) FROM \"CorrectiveAction\" WHERE CAST(status AS text) = 'IN_PROGRESS'"));
        summary.setCompletedCorrectiveActions(queryCount("SELECT COUNT(*) FROM \"CorrectiveAction\" WHERE CAST(status AS text) = 'COMPLETED'"));
        summary.setVerifiedCorrectiveActions(queryCount("SELECT COUNT(*) FROM \"CorrectiveAction\" WHERE CAST(status AS text) = 'VERIFIED'"));
        summary.setClosedCorrectiveActions(queryCount("SELECT COUNT(*) FROM \"CorrectiveAction\" WHERE CAST(status AS text) = 'CLOSED'"));
        summary.setOverdueCorrectiveActions(queryCount(
                "SELECT COUNT(*) FROM \"CorrectiveAction\" WHERE \"dueDate\" < NOW() AND CAST(status AS text) NOT IN ('COMPLETED', 'VERIFIED', 'CLOSED')"
        ));

        // Verification metrics
        summary.setTotalVerifications(queryCount("SELECT COUNT(*) FROM \"Verification\""));
        summary.setPendingVerifications(queryCount("SELECT COUNT(*) FROM \"Verification\" WHERE CAST(status AS text) = 'PENDING'"));
        summary.setApprovedVerifications(queryCount("SELECT COUNT(*) FROM \"Verification\" WHERE CAST(status AS text) = 'APPROVED'"));
        summary.setRejectedVerifications(queryCount("SELECT COUNT(*) FROM \"Verification\" WHERE CAST(status AS text) = 'REJECTED'"));

        return summary;
    }

    private long queryCount(String sql) {
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }
}
