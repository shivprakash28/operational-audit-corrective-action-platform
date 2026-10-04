package com.audit.platform.scheduler;

import com.audit.platform.dto.CorrectiveActionResponse;
import com.audit.platform.service.CorrectiveActionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(name = "audit.scheduler.overdue-corrective-actions.enabled", havingValue = "true", matchIfMissing = true)
public class OverdueCorrectiveActionScheduler {

    private static final Logger log = LoggerFactory.getLogger(OverdueCorrectiveActionScheduler.class);

    private final CorrectiveActionService correctiveActionService;

    public OverdueCorrectiveActionScheduler(CorrectiveActionService correctiveActionService) {
        this.correctiveActionService = correctiveActionService;
    }

    @Scheduled(fixedRateString = "${audit.scheduler.overdue-corrective-actions.fixed-rate:3600000}")
    public void processOverdueCorrectiveActions() {
        log.info("[OverdueCorrectiveActionScheduler] Starting scheduled overdue corrective actions scan...");

        try {
            List<CorrectiveActionResponse> overdueActions = correctiveActionService.getOverdueCorrectiveActions();

            if (overdueActions.isEmpty()) {
                log.info("[OverdueCorrectiveActionScheduler] Scan completed. No overdue corrective actions found.");
            } else {
                log.warn("[OverdueCorrectiveActionScheduler] Identified {} overdue corrective action(s):", overdueActions.size());
                for (CorrectiveActionResponse action : overdueActions) {
                    log.warn("  - Action ID: {}, Title: '{}', Due Date: {}, Status: {}, Owner ID: {}",
                            action.getId(),
                            action.getTitle(),
                            action.getDueDate(),
                            action.getStatus(),
                            action.getOwnerId()
                    );
                }
            }
        } catch (Exception e) {
            log.error("[OverdueCorrectiveActionScheduler] Error during scheduled scan for overdue actions", e);
        }
    }
}
