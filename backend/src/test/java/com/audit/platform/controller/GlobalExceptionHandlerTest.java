package com.audit.platform.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleValidationExceptions_returnsBadRequest() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("objectName", "title", "Title is required");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleValidationExceptions(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("message"));
        assertTrue(((Map<?, ?>) response.getBody().get("errors")).containsKey("title"));
    }

    @Test
    void handleConstraintViolation_returnsBadRequest() {
        ConstraintViolationException ex = mock(ConstraintViolationException.class);
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        
        when(violation.getPropertyPath()).thenReturn(mock(jakarta.validation.Path.class));
        when(violation.getPropertyPath().toString()).thenReturn("email");
        when(violation.getMessage()).thenReturn("Invalid email format");
        when(ex.getConstraintViolations()).thenReturn(Set.of(violation));

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleConstraintViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("message"));
    }

    @Test
    void handleIllegalArgument_returnsBadRequest() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid argument specified");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid argument specified", response.getBody().get("message"));
    }

    @Test
    void handleIllegalState_returnsBadRequest() {
        IllegalStateException ex = new IllegalStateException("Illegal state reached");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleIllegalState(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Illegal state reached", response.getBody().get("message"));
    }

    @Test
    void handleNotFound_returnsNotFound() {
        NoSuchElementException ex = new NoSuchElementException("Audit not found with id: 99");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Audit not found with id: 99", response.getBody().get("message"));
    }

    @Test
    void handleNoResourceFound_returnsNotFound() {
        NoResourceFoundException ex = mock(NoResourceFoundException.class);
        when(ex.getResourcePath()).thenReturn("/api/non-existent");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleNoResourceFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("Resource not found"));
    }

    @Test
    void handleMethodArgumentTypeMismatch_returnsBadRequest() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("id");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleMethodArgumentTypeMismatch(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("Invalid parameter type for parameter 'id'"));
    }

    @Test
    void handleDataIntegrityViolation_returnsBadRequest() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("FK constraint failed");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Database constraint violation: duplicate record or invalid foreign key reference", response.getBody().get("message"));
    }

    @Test
    void handleMessageNotReadable_returnsBadRequest() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleMessageNotReadable(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request body or status value", response.getBody().get("message"));
    }

    @Test
    void handleAccessDenied_returnsForbidden() {
        AccessDeniedException ex = new AccessDeniedException("Forbidden action");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Access is denied", response.getBody().get("message"));
    }

    @Test
    void handleAuthentication_returnsUnauthorized() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleAuthentication(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("Authentication failed"));
    }

    @Test
    void handleGenericException_returnsInternalServerError() {
        Exception ex = new RuntimeException("Unexpected internal crash with secret database info");

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An internal server error occurred", response.getBody().get("message"));
        assertFalse(response.getBody().get("message").contains("database"));
    }
}
