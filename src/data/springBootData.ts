export interface SpringBootFile {
  id: string;
  category: "Entity" | "DTO" | "Repository" | "Service" | "Controller" | "Security" | "Exception" | "Flyway" | "Mapper" | "Test";
  fileName: string;
  path: string;
  language: string;
  code: string;
  description: string;
}

export const springBootFiles: SpringBootFile[] = [
  {
    id: "sb-entity-user",
    category: "Entity",
    fileName: "User.java",
    path: "src/main/java/dev/architectai/platform/entity/User.java",
    language: "java",
    description: "Represents the central User account, secured with standard JPA annotations, field-level validation, and audit tracking.",
    code: `package dev.architectai.platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(min = 8, max = 128)
    @Column(nullable = false)
    private String password;

    @Column(name = "target_company")
    private String targetCompany;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }
}`
  },
  {
    id: "sb-entity-eval",
    category: "Entity",
    fileName: "Evaluation.java",
    path: "src/main/java/dev/architectai/platform/entity/Evaluation.java",
    language: "java",
    description: "Represents an interview evaluation instance detailing score, verdict, and structured list items of strengths/gaps.",
    code: `package dev.architectai.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.type.descriptor.jdbc.JsonJdbcType;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "scenario_id", nullable = false)
    private UUID scenarioId;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private String verdict;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

    @Column(name = "user_solution", columnDefinition = "TEXT", nullable = false)
    private String userSolution;

    @Column(name = "recommended_architecture", columnDefinition = "TEXT")
    private String recommendedArchitecture;

    @JdbcTypeCode(org.hibernate.annotations.SqlType.JSON)
    @Column(columnDefinition = "jsonb")
    private List<DimensionRating> dimensions;

    @JdbcTypeCode(org.hibernate.annotations.SqlType.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> strengths;

    @JdbcTypeCode(org.hibernate.annotations.SqlType.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> gaps;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DimensionRating {
        private String name;
        private String rating;
        private String feedback;
    }
}`
  },
  {
    id: "sb-dto-eval-req",
    category: "DTO",
    fileName: "EvaluationRequestDTO.java",
    path: "src/main/java/dev/architectai/platform/dto/EvaluationRequestDTO.java",
    language: "java",
    description: "Validated Data Transfer Object carrying incoming interview submission strings for AI processing.",
    code: `package dev.architectai.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class EvaluationRequestDTO {

    @NotNull(message = "Scenario ID cannot be null")
    private UUID scenarioId;

    @NotBlank(message = "Proposal solution cannot be blank")
    @Size(min = 100, max = 15000, message = "Proposal must be between 100 and 15,000 characters")
    private String userSolution;
}`
  },
  {
    id: "sb-repo-user",
    category: "Repository",
    fileName: "UserRepository.java",
    path: "src/main/java/dev/architectai/platform/repository/UserRepository.java",
    language: "java",
    description: "JPA Repository interface defining custom database queries for system user retrieval.",
    code: `package dev.architectai.platform.repository;

import dev.architectai.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}`
  },
  {
    id: "sb-service-eval",
    category: "Service",
    fileName: "EvaluationService.java",
    path: "src/main/java/dev/architectai/platform/service/EvaluationService.java",
    language: "java",
    description: "Transactional service orchestrating Gemini API integration and database persistence of architectural feedback.",
    code: `package dev.architectai.platform.service;

import dev.architectai.platform.dto.EvaluationRequestDTO;
import dev.architectai.platform.entity.Evaluation;
import dev.architectai.platform.entity.User;
import dev.architectai.platform.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final GeminiAiClient geminiAiClient;

    @Transactional
    public Evaluation evaluateAndSave(User currentUser, EvaluationRequestDTO request) {
        log.info("Processing design evaluation for user: {} scenario: {}", currentUser.getEmail(), request.getScenarioId());
        
        // Connect to Gemini LLM to parse and score architecture proposal
        Evaluation result = geminiAiClient.requestEvaluation(request.getUserSolution());
        
        result.setUser(currentUser);
        result.setScenarioId(request.getScenarioId());
        result.setUserSolution(request.getUserSolution());

        Evaluation saved = evaluationRepository.save(result);
        log.info("Evaluation completed. Saved with ID: {}", saved.getId());
        return saved;
    }
}`
  },
  {
    id: "sb-controller-eval",
    category: "Controller",
    fileName: "EvaluationController.java",
    path: "src/main/java/dev/architectai/platform/controller/EvaluationController.java",
    language: "java",
    description: "REST controller exposing authenticated endpoints for evaluations.",
    code: `package dev.architectai.platform.controller;

import dev.architectai.platform.dto.EvaluationRequestDTO;
import dev.architectai.platform.entity.Evaluation;
import dev.architectai.platform.entity.User;
import dev.architectai.platform.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/evaluate")
    public ResponseEntity<Evaluation> evaluateProposal(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody EvaluationRequestDTO request) {
        
        Evaluation result = evaluationService.evaluateAndSave(currentUser, request);
        return ResponseEntity.ok(result);
    }
}`
  },
  {
    id: "sb-sec-config",
    category: "Security",
    fileName: "SecurityConfig.java",
    path: "src/main/java/dev/architectai/platform/config/SecurityConfig.java",
    language: "java",
    description: "Configures stateless JWT authentication, path-based access controls, CORS, and password hashing standard.",
    code: `package dev.architectai.platform.config;

import dev.architectai.platform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/health").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`
  },
  {
    id: "sb-exc-global",
    category: "Exception",
    fileName: "GlobalExceptionHandler.java",
    path: "src/main/java/dev/architectai/platform/exception/GlobalExceptionHandler.java",
    language: "java",
    description: "Centralized ControllerAdvice catching API anomalies, validating failures, and formatting standard JSON errors.",
    code: `package dev.architectai.platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "VALIDATION_FAILED");
        body.put("message", "Request parameters did not pass input validation rubrics");
        body.put("details", errors);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "INTERNAL_SERVER_ERROR");
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}`
  },
  {
    id: "sb-flyway-schema",
    category: "Flyway",
    fileName: "V1__init_schema.sql",
    path: "src/main/resources/db/migration/V1__init_schema.sql",
    language: "sql",
    description: "Database migration file establishing standard PostgreSQL layouts with JSONB structures and b-tree indexes.",
    code: `-- Flyway database schema initialization

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    target_company VARCHAR(100),
    experience_years INTEGER,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL,
    score INTEGER NOT NULL,
    verdict VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    user_solution TEXT NOT NULL,
    recommended_architecture TEXT,
    dimensions JSONB NOT NULL,
    strengths JSONB NOT NULL,
    gaps JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Optimize analytics queries on dimensions and scores
CREATE INDEX idx_evaluations_user_score ON evaluations(user_id, score);
CREATE INDEX idx_evaluations_json_dimensions ON evaluations USING gin (dimensions);
`
  },
  {
    id: "sb-test-controller",
    category: "Test",
    fileName: "UserControllerTest.java",
    path: "src/test/java/dev/architectai/platform/controller/UserControllerTest.java",
    language: "java",
    description: "Controller slice unit test utilizing JUnit 5, MockMvc, and Mockito to validate REST request parsing, authorization filters, and standard JSON errors.",
    code: `package dev.architectai.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.architectai.platform.dto.UserRegistrationDto;
import dev.architectai.platform.entity.User;
import dev.architectai.platform.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UserRegistrationDto validRequest;
    private User mockedResponse;

    @BeforeEach
    void setUp() {
        validRequest = UserRegistrationDto.builder()
                .name("Prasath Merz")
                .email("prasath@architectai.dev")
                .password("SecurePass123!")
                .targetCompany("Google")
                .experienceYears(8)
                .build();

        mockedResponse = User.builder()
                .id(UUID.randomUUID())
                .name("Prasath Merz")
                .email("prasath@architectai.dev")
                .role(User.Role.ROLE_USER)
                .build();
    }

    @Test
    @WithMockUser
    void registerUser_WhenValidInput_ReturnsCreatedUser() throws Exception {
        when(userService.registerNewUser(any(UserRegistrationDto.class)))
                .thenReturn(mockedResponse);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Prasath Merz"))
                .andExpect(jsonPath("$.email").value("prasath@architectai.dev"));
    }

    @Test
    @WithMockUser
    void registerUser_WhenMalformedEmail_ReturnsBadRequest() throws Exception {
        validRequest.setEmail("malformed-email-string");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.details.email").exists());
    }
}`
  },
  {
    id: "sb-test-service",
    category: "Test",
    fileName: "UserServiceTest.java",
    path: "src/test/java/dev/architectai/platform/service/UserServiceTest.java",
    language: "java",
    description: "Service layer core unit tests utilizing pure JUnit 5 and Mockito to assert password hashing filters and registration duplicate constraints.",
    code: `package dev.architectai.platform.service;

import dev.architectai.platform.dto.UserRegistrationDto;
import dev.architectai.platform.entity.User;
import dev.architectai.platform.exception.DuplicateEmailException;
import dev.architectai.platform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserRegistrationDto registrationDto;

    @BeforeEach
    void setUp() {
        registrationDto = UserRegistrationDto.builder()
                .name("Alice SDE")
                .email("alice@architectai.dev")
                .password("rawPassword123")
                .targetCompany("Amazon")
                .experienceYears(5)
                .build();
    }

    @Test
    void registerNewUser_WhenEmailUnique_EncryptsPasswordAndPersists() {
        // Arrange
        when(userRepository.findByEmail(registrationDto.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("rawPassword123")).thenReturn("encryptedHashSHA256");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User savedUser = userService.registerNewUser(registrationDto);

        // Assert
        assertNotNull(savedUser);
        assertEquals("encryptedHashSHA256", savedUser.getPassword());
        assertEquals("Alice SDE", savedUser.getName());
        assertEquals(User.Role.ROLE_USER, savedUser.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerNewUser_WhenEmailAlreadyExists_ThrowsDuplicateEmailException() {
        // Arrange
        when(userRepository.findByEmail(registrationDto.getEmail()))
                .thenReturn(Optional.of(new User()));

        // Act & Assert
        assertThrows(DuplicateEmailException.class, () -> {
            userService.registerNewUser(registrationDto);
        });

        verify(userRepository, never()).save(any(User.class));
    }
}`
  },
  {
    id: "sb-test-repository",
    category: "Test",
    fileName: "UserRepositoryTest.java",
    path: "src/test/java/dev/architectai/platform/repository/UserRepositoryTest.java",
    language: "java",
    description: "Repository slice database test featuring @DataJpaTest and embedded H2 schema interactions to verify spring-data repository indexing.",
    code: `package dev.architectai.platform.repository;

import dev.architectai.platform.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_WhenUserExists_ReturnsUserOptional() {
        // Arrange
        User user = User.builder()
                .name("Repository Test")
                .email("repo@architectai.dev")
                .password("some-password-hash")
                .role(User.Role.ROLE_USER)
                .build();
        entityManager.persistAndFlush(user);

        // Act
        Optional<User> found = userRepository.findByEmail("repo@architectai.dev");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("repo@architectai.dev", found.get().getEmail());
        assertEquals("Repository Test", found.get().getName());
    }

    @Test
    void findByEmail_WhenUserNotPresent_ReturnsEmptyOptional() {
        // Act
        Optional<User> found = userRepository.findByEmail("non-existent@architectai.dev");

        // Assert
        assertTrue(found.isEmpty());
    }
}`
  },
  {
    id: "sb-test-integration",
    category: "Test",
    fileName: "UserIntegrationTest.java",
    path: "src/test/java/dev/architectai/platform/integration/UserIntegrationTest.java",
    language: "java",
    description: "Full end-to-end integration test employing Testcontainers (PostgreSQL Container) to assert active system state transitions against actual container infrastructure.",
    code: `package dev.architectai.platform.integration;

import dev.architectai.platform.dto.UserRegistrationDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class UserIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("architectdb")
            .withUsername("sa")
            .withPassword("secret");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void registerAndReadUser_E2E_Success() {
        // Arrange
        UserRegistrationDto request = UserRegistrationDto.builder()
                .name("E2E SDE Candidate")
                .email("e2e@architectai.dev")
                .password("ComplexPassword99!")
                .targetCompany("Uber")
                .experienceYears(10)
                .build();

        String url = "http://localhost:" + port + "/api/users/register";

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("e2e@architectai.dev", response.getBody().get("email"));
        assertEquals("E2E SDE Candidate", response.getBody().get("name"));
    }
}`
  }
];
