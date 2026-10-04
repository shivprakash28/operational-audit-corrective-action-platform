package com.audit.platform.service;

import com.audit.platform.dto.CorrectiveActionRequest;
import com.audit.platform.dto.CorrectiveActionResponse;
import com.audit.platform.entity.CorrectiveAction;
import com.audit.platform.entity.CorrectiveActionStatus;
import com.audit.platform.entity.Finding;
import com.audit.platform.entity.User;
import com.audit.platform.repository.CorrectiveActionRepository;
import com.audit.platform.repository.FindingRepository;
import com.audit.platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class CorrectiveActionService {

    private final CorrectiveActionRepository correctiveActionRepository;
    private final FindingRepository findingRepository;
    private final UserRepository userRepository;

    public CorrectiveActionService(CorrectiveActionRepository correctiveActionRepository,
                                  FindingRepository findingRepository,
                                  UserRepository userRepository) {
        this.correctiveActionRepository = correctiveActionRepository;
        this.findingRepository = findingRepository;
        this.userRepository = userRepository;
    }

    public CorrectiveActionResponse createCorrectiveAction(Long findingId, CorrectiveActionRequest request) {
        Long targetFindingId = findingId != null ? findingId : request.getFindingId();
        if (targetFindingId == null) {
            throw new IllegalArgumentException("Finding ID is required");
        }
        if (request.getFindingId() != null && findingId != null && !Objects.equals(request.getFindingId(), findingId)) {
            throw new IllegalArgumentException("Finding ID in payload does not match path parameter");
        }

        Finding finding = findingRepository.findById(targetFindingId)
                .orElseThrow(() -> new NoSuchElementException("Finding not found with id: " + targetFindingId));

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("Owner user not found with id: " + request.getOwnerId()));

        if (request.getDueDate() == null) {
            throw new IllegalArgumentException("Deadline (dueDate) is required");
        }

        CorrectiveAction correctiveAction = new CorrectiveAction();
        correctiveAction.setFinding(finding);
        correctiveAction.setTitle(request.getTitle());
        correctiveAction.setDescription(request.getDescription());
        correctiveAction.setOwner(owner);
        correctiveAction.setDueDate(request.getDueDate());
        correctiveAction.setStatus(request.getStatus() != null ? request.getStatus() : CorrectiveActionStatus.OPEN);

        LocalDateTime now = LocalDateTime.now();
        correctiveAction.setCreatedAt(now);
        correctiveAction.setUpdatedAt(now);

        CorrectiveAction saved = correctiveActionRepository.save(correctiveAction);
        return CorrectiveActionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CorrectiveActionResponse> getCorrectiveActionsByFindingId(Long findingId) {
        if (!findingRepository.existsById(findingId)) {
            throw new NoSuchElementException("Finding not found with id: " + findingId);
        }
        return correctiveActionRepository.findByFindingIdWithDetails(findingId)
                .stream()
                .map(CorrectiveActionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CorrectiveActionResponse> getAllCorrectiveActions() {
        return correctiveActionRepository.findAllWithDetails()
                .stream()
                .map(CorrectiveActionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CorrectiveActionResponse getCorrectiveActionById(Long id) {
        CorrectiveAction correctiveAction = correctiveActionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Corrective action not found with id: " + id));
        return CorrectiveActionResponse.fromEntity(correctiveAction);
    }

    public CorrectiveActionResponse updateCorrectiveAction(Long id, CorrectiveActionRequest request) {
        CorrectiveAction correctiveAction = correctiveActionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Corrective action not found with id: " + id));

        if (request.getFindingId() != null && !Objects.equals(request.getFindingId(), correctiveAction.getFinding().getId())) {
            Finding newFinding = findingRepository.findById(request.getFindingId())
                    .orElseThrow(() -> new NoSuchElementException("Finding not found with id: " + request.getFindingId()));
            correctiveAction.setFinding(newFinding);
        }

        if (request.getOwnerId() != null) {
            User owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Owner user not found with id: " + request.getOwnerId()));
            correctiveAction.setOwner(owner);
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            correctiveAction.setTitle(request.getTitle());
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            correctiveAction.setDescription(request.getDescription());
        }

        if (request.getDueDate() != null) {
            correctiveAction.setDueDate(request.getDueDate());
        }

        if (request.getStatus() != null) {
            correctiveAction.setStatus(request.getStatus());
        }

        correctiveAction.setUpdatedAt(LocalDateTime.now());

        CorrectiveAction saved = correctiveActionRepository.save(correctiveAction);
        return CorrectiveActionResponse.fromEntity(saved);
    }

    public CorrectiveActionResponse updateStatus(Long id, CorrectiveActionStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        CorrectiveAction correctiveAction = correctiveActionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Corrective action not found with id: " + id));

        correctiveAction.setStatus(status);
        correctiveAction.setUpdatedAt(LocalDateTime.now());

        CorrectiveAction saved = correctiveActionRepository.save(correctiveAction);
        return CorrectiveActionResponse.fromEntity(saved);
    }
}
