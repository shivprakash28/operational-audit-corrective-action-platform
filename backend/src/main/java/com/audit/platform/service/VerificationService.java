package com.audit.platform.service;

import com.audit.platform.dto.VerificationRequest;
import com.audit.platform.dto.VerificationResponse;
import com.audit.platform.entity.*;
import com.audit.platform.repository.CorrectiveActionRepository;
import com.audit.platform.repository.EvidenceRepository;
import com.audit.platform.repository.UserRepository;
import com.audit.platform.repository.VerificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final CorrectiveActionRepository correctiveActionRepository;
    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;

    public VerificationService(VerificationRepository verificationRepository,
                               CorrectiveActionRepository correctiveActionRepository,
                               EvidenceRepository evidenceRepository,
                               UserRepository userRepository) {
        this.verificationRepository = verificationRepository;
        this.correctiveActionRepository = correctiveActionRepository;
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
    }

    public VerificationResponse createVerification(Long correctiveActionId, VerificationRequest request) {
        Long targetActionId = correctiveActionId != null ? correctiveActionId : request.getCorrectiveActionId();
        if (targetActionId == null) {
            throw new IllegalArgumentException("Corrective Action ID is required");
        }
        if (request.getCorrectiveActionId() != null && correctiveActionId != null && !Objects.equals(request.getCorrectiveActionId(), correctiveActionId)) {
            throw new IllegalArgumentException("Corrective Action ID in body does not match path parameter");
        }

        CorrectiveAction correctiveAction = correctiveActionRepository.findById(targetActionId)
                .orElseThrow(() -> new NoSuchElementException("Corrective action not found with id: " + targetActionId));

        User verifier = userRepository.findById(request.getVerifierId())
                .orElseThrow(() -> new IllegalArgumentException("Verifier user not found with id: " + request.getVerifierId()));

        VerificationStatus status = request.getStatus() != null ? request.getStatus() : VerificationStatus.PENDING;

        Verification verification = new Verification();
        verification.setCorrectiveAction(correctiveAction);
        verification.setVerifier(verifier);
        verification.setStatus(status);
        verification.setComments(request.getComments());

        if (status == VerificationStatus.APPROVED) {
            verification.setVerifiedAt(LocalDateTime.now());
            correctiveAction.setStatus(CorrectiveActionStatus.VERIFIED);
            correctiveActionRepository.save(correctiveAction);
        } else if (status == VerificationStatus.REJECTED) {
            verification.setVerifiedAt(LocalDateTime.now());
            correctiveAction.setStatus(CorrectiveActionStatus.IN_PROGRESS);
            correctiveActionRepository.save(correctiveAction);
        }

        Verification saved = verificationRepository.save(verification);
        return VerificationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getVerificationsByCorrectiveActionId(Long correctiveActionId) {
        if (!correctiveActionRepository.existsById(correctiveActionId)) {
            throw new NoSuchElementException("Corrective action not found with id: " + correctiveActionId);
        }
        return verificationRepository.findByCorrectiveActionIdWithDetails(correctiveActionId)
                .stream()
                .map(VerificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getAllVerifications() {
        return verificationRepository.findAllWithDetails()
                .stream()
                .map(VerificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VerificationResponse getVerificationById(Long id) {
        Verification verification = verificationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Verification not found with id: " + id));
        return VerificationResponse.fromEntity(verification);
    }

    public VerificationResponse approveVerification(Long id, String comments) {
        Verification verification = verificationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Verification not found with id: " + id));

        verification.setStatus(VerificationStatus.APPROVED);
        verification.setVerifiedAt(LocalDateTime.now());
        if (comments != null && !comments.isBlank()) {
            verification.setComments(comments);
        }

        CorrectiveAction correctiveAction = verification.getCorrectiveAction();
        if (correctiveAction != null) {
            correctiveAction.setStatus(CorrectiveActionStatus.VERIFIED);
            correctiveActionRepository.save(correctiveAction);
        }

        Verification saved = verificationRepository.save(verification);
        return VerificationResponse.fromEntity(saved);
    }

    public VerificationResponse rejectVerification(Long id, String comments) {
        Verification verification = verificationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Verification not found with id: " + id));

        verification.setStatus(VerificationStatus.REJECTED);
        verification.setVerifiedAt(LocalDateTime.now());
        if (comments != null && !comments.isBlank()) {
            verification.setComments(comments);
        }

        CorrectiveAction correctiveAction = verification.getCorrectiveAction();
        if (correctiveAction != null) {
            // Revert status to IN_PROGRESS so action owner can address rejection
            correctiveAction.setStatus(CorrectiveActionStatus.IN_PROGRESS);
            correctiveActionRepository.save(correctiveAction);
        }

        Verification saved = verificationRepository.save(verification);
        return VerificationResponse.fromEntity(saved);
    }

    public VerificationResponse updateStatus(Long id, VerificationStatus status, String comments) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        if (status == VerificationStatus.APPROVED) {
            return approveVerification(id, comments);
        } else if (status == VerificationStatus.REJECTED) {
            return rejectVerification(id, comments);
        } else {
            Verification verification = verificationRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Verification not found with id: " + id));
            verification.setStatus(status);
            if (comments != null && !comments.isBlank()) {
                verification.setComments(comments);
            }
            Verification saved = verificationRepository.save(verification);
            return VerificationResponse.fromEntity(saved);
        }
    }
}
