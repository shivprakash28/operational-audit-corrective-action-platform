package com.audit.platform.scheduler;

import com.audit.platform.dto.CorrectiveActionResponse;
import com.audit.platform.entity.CorrectiveActionStatus;
import com.audit.platform.service.CorrectiveActionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OverdueCorrectiveActionSchedulerTest {

    @Mock
    private CorrectiveActionService correctiveActionService;

    @InjectMocks
    private OverdueCorrectiveActionScheduler scheduler;

    private CorrectiveActionResponse overdueAction;

    @BeforeEach
    void setUp() {
        overdueAction = new CorrectiveActionResponse();
        overdueAction.setId(100L);
        overdueAction.setTitle("Overdue Equipment Check");
        overdueAction.setStatus(CorrectiveActionStatus.OPEN);
        overdueAction.setDueDate(LocalDateTime.now().minusDays(2));
        overdueAction.setOwnerId(5L);
    }

    @Test
    void processOverdueCorrectiveActions_LogsOverdueActions_WhenOverdueExist() {
        when(correctiveActionService.getOverdueCorrectiveActions()).thenReturn(List.of(overdueAction));

        scheduler.processOverdueCorrectiveActions();

        verify(correctiveActionService, times(1)).getOverdueCorrectiveActions();
    }

    @Test
    void processOverdueCorrectiveActions_LogsNoOverdue_WhenNoneOverdue() {
        when(correctiveActionService.getOverdueCorrectiveActions()).thenReturn(Collections.emptyList());

        scheduler.processOverdueCorrectiveActions();

        verify(correctiveActionService, times(1)).getOverdueCorrectiveActions();
    }
}
