package com.audit.platform.repository;

import com.audit.platform.entity.CorrectiveAction;
import com.audit.platform.entity.CorrectiveActionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CorrectiveActionRepository extends JpaRepository<CorrectiveAction, Long> {

    List<CorrectiveAction> findByFindingId(Long findingId);

    @Query("SELECT c FROM CorrectiveAction c JOIN FETCH c.finding f JOIN FETCH c.owner u WHERE c.id = :id")
    Optional<CorrectiveAction> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT c FROM CorrectiveAction c JOIN FETCH c.finding f JOIN FETCH c.owner u WHERE f.id = :findingId")
    List<CorrectiveAction> findByFindingIdWithDetails(@Param("findingId") Long findingId);

    @Query("SELECT c FROM CorrectiveAction c JOIN FETCH c.finding f JOIN FETCH c.owner u")
    List<CorrectiveAction> findAllWithDetails();

    @Query("SELECT c FROM CorrectiveAction c JOIN FETCH c.finding f JOIN FETCH c.owner u WHERE c.dueDate < :now AND c.status NOT IN (:excludedStatuses)")
    List<CorrectiveAction> findOverdueActions(@Param("now") LocalDateTime now, @Param("excludedStatuses") List<CorrectiveActionStatus> excludedStatuses);
}
