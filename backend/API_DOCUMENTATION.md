# Operational Audit & Corrective Action Platform — Backend API Contract Documentation

This document provides complete, authoritative API contract documentation for all implemented Spring Boot REST endpoints in the system.

---

## Table of Contents
1. [Authentication (`/api/auth`)](#1-authentication-apiauth)
2. [Audit Planning (`/api/audits`)](#2-audit-planning-apiaudits)
3. [Auditor Assignment (`/api/audits/{auditId}/assign`)](#3-auditor-assignment-apiauditsauditidassign)
4. [Checklist Management (`/api/checklist-templates` & `/api/audits/{auditId}/checklists`)](#4-checklist-management-apichecklist-templates--apiauditsauditidchecklists)
5. [Observation Management (`/api/observations` & `/api/audits/{auditId}/observations`)](#5-observation-management-apiobservations--apiauditsauditidobservations)
6. [Finding Management (`/api/findings` & `/api/audits/{auditId}/findings`)](#6-finding-management-apifindings--apiauditsauditidfindings)
7. [Corrective Action Management (`/api/corrective-actions` & `/api/findings/{findingId}/corrective-actions`)](#7-corrective-action-management-apicorrective-actions--apifindingsfindingidcorrective-actions)
8. [Evidence Management (`/api/evidence` & `/api/corrective-actions/{correctiveActionId}/evidence`)](#8-evidence-management-apievidence--apicorrective-actionscorrectiveactionidevidence)
9. [Verification & Closure (`/api/verifications` & `/api/corrective-actions/{correctiveActionId}/verifications`)](#9-verification--closure-apiverifications--apicorrective-actionscorrectiveactionidverifications)
10. [Compliance Dashboard (`/api/dashboard`)](#10-compliance-dashboard-apidashboard)

---

## 1. Authentication (`/api/auth`)

### 1.1 User Login
- **HTTP Method**: `POST`
- **URL**: `/api/auth/login`
- **Purpose**: Authenticate user credentials and return JWT Bearer token.
- **Authentication**: Public (Unauthenticated)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Validation Rules**: `email` must be valid and non-blank; `password` must be non-blank.
- **Success Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "name": "Jane Auditor",
    "email": "user@example.com",
    "role": "AUDITOR"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or invalid email/password.

---

## 2. Audit Planning (`/api/audits`)

### 2.1 Create Audit
- **HTTP Method**: `POST`
- **URL**: `/api/audits`
- **Purpose**: Create a new operational audit plan.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Any authenticated role (`ADMIN`, `AUDITOR`, etc.)
- **Request Body**:
  ```json
  {
    "title": "Q4 Safety Audit",
    "scope": "Factory Floor A",
    "objectives": "Verify compliance with ISO 45001",
    "criteria": "Safety Standard v2",
    "plannedStartDate": "2026-11-01T09:00:00",
    "plannedEndDate": "2026-11-05T17:00:00",
    "expectedCompletionDate": "2026-11-10T17:00:00",
    "departmentId": 1,
    "createdById": 2
  }
  ```
- **Validation Rules**: `title`, `scope`, `objectives`, `criteria`, `plannedStartDate`, `plannedEndDate`, `departmentId`, `createdById` are required.
- **Success Response**: `201 Created`
- **Error Responses**: `400 Bad Request` (validation/invalid references), `401 Unauthorized`, `403 Forbidden`.

### 2.2 Get All Audits
- **HTTP Method**: `GET`
- **URL**: `/api/audits`
- **Purpose**: Retrieve list of all audits.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response**: `200 OK` (`List<AuditResponse>`)

### 2.3 Get Audit By ID
- **HTTP Method**: `GET`
- **URL**: `/api/audits/{id}`
- **Purpose**: Retrieve audit details by ID.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response**: `200 OK` (`AuditResponse`)
- **Error Responses**: `404 Not Found` if audit ID does not exist.

### 2.4 Update Audit
- **HTTP Method**: `PUT`
- **URL**: `/api/audits/{id}`
- **Purpose**: Update an existing audit record.
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**: Same as Create Audit (supports updating status: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`).
- **Success Response**: `200 OK` (`AuditResponse`)
- **Error Responses**: `400 Bad Request`, `404 Not Found`.

### 2.5 Delete Audit
- **HTTP Method**: `DELETE`
- **URL**: `/api/audits/{id}`
- **Purpose**: Delete an audit by ID.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response**: `204 No Content`
- **Error Responses**: `404 Not Found`.

---

## 3. Auditor Assignment (`/api/audits/{auditId}/assign`)

### 3.1 Assign Auditor to Audit
- **HTTP Method**: `POST`
- **URL**: `/api/audits/{auditId}/assign`
- **Purpose**: Assign an auditor user to an audit. Enforces same-department conflict and duplicate assignment rules.
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "auditorId": 5
  }
  ```
- **Validation Rules**: `auditorId` is required. User must have role `AUDITOR` and must NOT belong to the audit's target department.
- **Success Response**: `201 Created` (`AuditAssignmentResponse`)
- **Error Responses**: `400 Bad Request` (conflict of interest or duplicate assignment), `404 Not Found`.

### 3.2 Get Assignments for Audit
- **HTTP Method**: `GET`
- **URL**: `/api/audits/{auditId}/assignments`
- **Purpose**: List all assigned auditors for a specific audit.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response**: `200 OK` (`List<AuditAssignmentResponse>`)
- **Error Responses**: `404 Not Found`.

---

## 4. Checklist Management (`/api/checklist-templates` & `/api/audits/{auditId}/checklists`)

### 4.1 Create Checklist Template
- **HTTP Method**: `POST`
- **URL**: `/api/checklist-templates`
- **Purpose**: Create a checklist template with category items.
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "Fire Safety Inspection Checklist",
    "departmentId": 1,
    "items": [
      {
        "itemText": "Are fire extinguishers inspected monthly?",
        "category": "FIRE_SAFETY",
        "weight": 1
      }
    ]
  }
  ```
- **Success Response**: `201 Created` (`ChecklistTemplateResponse`)

### 4.2 Get All Checklist Templates / By ID
- **HTTP Method**: `GET`
- **URL**: `/api/checklist-templates` | `/api/checklist-templates/{id}`
- **Success Response**: `200 OK`

### 4.3 Add Item to Checklist Template
- **HTTP Method**: `POST`
- **URL**: `/api/checklist-templates/{templateId}/items`
- **Success Response**: `201 Created` (`ChecklistItemResponse`)

### 4.4 Assign Checklist Template to Audit
- **HTTP Method**: `POST`
- **URL**: `/api/audits/{auditId}/checklists`
- **Request Body**: `{"templateId": 10}`
- **Success Response**: `201 Created` (`AuditChecklistResponse`)

### 4.5 Submit Checklist Item Response
- **HTTP Method**: `POST`
- **URL**: `/api/audits/{auditId}/checklists/{auditChecklistId}/responses`
- **Request Body**:
  ```json
  {
    "checklistItemId": 101,
    "complianceStatus": "NON_COMPLIANT",
    "comments": "Extinguisher expired",
    "score": 0.0
  }
  ```
- **Success Response**: `201 Created` (`ChecklistResponseDto`)

---

## 5. Observation Management (`/api/observations` & `/api/audits/{auditId}/observations`)

### 5.1 Create Observation
- **HTTP Method**: `POST`
- **URL**: `/api/audits/{auditId}/observations` | `/api/observations`
- **Purpose**: Record an observation against an audit checklist item. Enforces template relationship validation.
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "auditId": 1,
    "checklistItemId": 101,
    "description": "Pressure gauge reading below threshold",
    "evidenceUrl": "http://storage/img1.jpg",
    "createdById": 2
  }
  ```
- **Validation Rules**: `auditId`, `checklistItemId`, `description`, `createdById` required. Checklist item MUST belong to a template assigned to `auditId`.
- **Success Response**: `201 Created` (`ObservationResponse`)
- **Error Responses**: `400 Bad Request` (unrelated checklist item conflict), `404 Not Found`.

### 5.2 Get Observations
- **HTTP Method**: `GET`
- **URL**: `/api/audits/{auditId}/observations` | `/api/observations` | `/api/observations/{id}`
- **Success Response**: `200 OK`

---

## 6. Finding Management (`/api/findings` & `/api/audits/{auditId}/findings`)

### 6.1 Create Finding
- **HTTP Method**: `POST`
- **URL**: `/api/audits/{auditId}/findings` | `/api/findings`
- **Purpose**: Elevate an observation into a formal audit finding.
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "auditId": 1,
    "observationId": 50,
    "severity": "CRITICAL",
    "responsibleDepartmentId": 1,
    "ownerId": 3,
    "status": "OPEN",
    "description": "Expired safety equipment poses critical risk"
  }
  ```
- **Validation Rules**: `severity` must be `MINOR`, `MAJOR`, or `CRITICAL`. Observation must NOT already have an existing finding.
- **Success Response**: `201 Created` (`FindingResponse`)

### 6.2 Update Severity / Status
- **HTTP Method**: `PATCH`
- **URL**: `/api/findings/{id}/severity` | `/api/findings/{id}/status`
- **Query Params or JSON Body**: `severity=CRITICAL` / `status=RESOLVED`
- **Success Response**: `200 OK`

---

## 7. Corrective Action Management (`/api/corrective-actions`)

### 7.1 Create Corrective Action
- **HTTP Method**: `POST`
- **URL**: `/api/findings/{findingId}/corrective-actions` | `/api/corrective-actions`
- **Request Body**:
  ```json
  {
    "findingId": 5,
    "title": "Replace Pressure Valve",
    "description": "Order and install new safety valve",
    "ownerId": 3,
    "dueDate": "2026-11-15T10:00:00"
  }
  ```
- **Success Response**: `201 Created` (`CorrectiveActionResponse`)

### 7.2 Get Overdue Corrective Actions
- **HTTP Method**: `GET`
- **URL**: `/api/corrective-actions/overdue`
- **Purpose**: Retrieve overdue actions where `dueDate < NOW()` and status is not `COMPLETED`, `VERIFIED`, or `CLOSED`.
- **Success Response**: `200 OK` (`List<CorrectiveActionResponse>`)

### 7.3 Update Status
- **HTTP Method**: `PATCH`
- **URL**: `/api/corrective-actions/{id}/status?status=COMPLETED`
- **Statuses**: `OPEN`, `IN_PROGRESS`, `COMPLETED`, `VERIFIED`, `CLOSED`
- **Success Response**: `200 OK`

---

## 8. Evidence Management (`/api/evidence`)

### 8.1 Upload Evidence File
- **HTTP Method**: `POST`
- **URL**: `/api/corrective-actions/{correctiveActionId}/evidence` | `/api/evidence`
- **Consumes**: `multipart/form-data`
- **Form Data**:
  - `file`: `MultipartFile` (Required)
  - `correctiveActionId`: `Long` (Required)
  - `uploadedById`: `Long` (Optional)
- **Validation Rules**: File cannot be empty; extension must be allowed (`pdf`, `jpg`, `png`, `doc`, etc.).
- **Success Response**: `201 Created` (`EvidenceResponse`)

### 8.2 Download Evidence File
- **HTTP Method**: `GET`
- **URL**: `/api/evidence/{id}/download`
- **Success Response**: `200 OK` (`application/octet-stream` file attachment)

---

## 9. Verification & Closure (`/api/verifications`)

### 9.1 Create Verification
- **HTTP Method**: `POST`
- **URL**: `/api/corrective-actions/{correctiveActionId}/verifications` | `/api/verifications`
- **Request Body**:
  ```json
  {
    "correctiveActionId": 12,
    "verifierId": 2,
    "comments": "Inspect new installation"
  }
  ```
- **Success Response**: `201 Created` (`VerificationResponse` with status `PENDING`)

### 9.2 Approve / Reject Verification
- **HTTP Method**: `POST` / `PATCH` / `PUT`
- **URL**: `/api/verifications/{id}/approve` | `/api/verifications/{id}/reject`
- **Params / Body**: `comments="Installation verified successfully"`
- **Effects**:
  - `approve`: Verification status becomes `APPROVED`; Corrective Action status becomes `VERIFIED`.
  - `reject`: Verification status becomes `REJECTED`; Corrective Action status returns to `IN_PROGRESS`.
- **Success Response**: `200 OK` (`VerificationResponse`)

---

## 10. Compliance Dashboard (`/api/dashboard`)

### 10.1 Get Dashboard Summary
- **HTTP Method**: `GET`
- **URL**: `/api/dashboard/summary`
- **Purpose**: Calculate and return aggregated real-time compliance metrics using JDBC queries against PostgreSQL tables.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response**: `200 OK` (`DashboardResponse`)
  ```json
  {
    "totalAudits": 10,
    "plannedAudits": 4,
    "inProgressAudits": 3,
    "completedAudits": 2,
    "closedAudits": 1,
    "totalFindings": 15,
    "openFindings": 5,
    "inProgressFindings": 4,
    "resolvedFindings": 4,
    "closedFindings": 2,
    "criticalFindings": 2,
    "majorFindings": 8,
    "minorFindings": 5,
    "totalCorrectiveActions": 8,
    "openCorrectiveActions": 2,
    "inProgressCorrectiveActions": 3,
    "completedCorrectiveActions": 2,
    "verifiedCorrectiveActions": 1,
    "closedCorrectiveActions": 0,
    "overdueCorrectiveActions": 1,
    "totalVerifications": 5,
    "pendingVerifications": 1,
    "approvedVerifications": 3,
    "rejectedVerifications": 1
  }
  ```
