package com.audit.platform.security;

import com.audit.platform.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }

    @Test
    void generateToken_andValidate_forAdminRole() {
        String token = jwtService.generateToken("admin@test.com", Role.ADMIN.name());
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("admin@test.com", jwtService.extractEmail(token));
        assertEquals("ADMIN", jwtService.extractRole(token));
    }

    @Test
    void generateToken_andValidate_forAuditorRole() {
        String token = jwtService.generateToken("auditor@test.com", Role.AUDITOR.name());
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("auditor@test.com", jwtService.extractEmail(token));
        assertEquals("AUDITOR", jwtService.extractRole(token));
    }

    @Test
    void generateToken_andValidate_forDepartmentOwnerRole() {
        String token = jwtService.generateToken("owner@test.com", Role.DEPARTMENT_OWNER.name());
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("owner@test.com", jwtService.extractEmail(token));
        assertEquals("DEPARTMENT_OWNER", jwtService.extractRole(token));
    }

    @Test
    void generateToken_andValidate_forManagementRole() {
        String token = jwtService.generateToken("mgmt@test.com", Role.MANAGEMENT.name());
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("mgmt@test.com", jwtService.extractEmail(token));
        assertEquals("MANAGEMENT", jwtService.extractRole(token));
    }

    @Test
    void isTokenValid_returnsFalse_forTamperedToken() {
        String token = jwtService.generateToken("user@test.com", Role.AUDITOR.name());
        String tamperedToken = token + "invalid";
        assertFalse(jwtService.isTokenValid(tamperedToken));
    }

    @Test
    void isTokenValid_returnsFalse_forMalformedToken() {
        assertFalse(jwtService.isTokenValid("not-a-valid-jwt-token"));
    }
}
