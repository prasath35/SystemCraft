# =========================================================
# Stage 1: Build Phase (Maven compilation)
# =========================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy the pom.xml and resolve dependencies (layer caching)
COPY pom.xml .
RUN mnv dependency:go-offline -B

# Copy source directory
COPY src ./src

# Pack the production jar (skipping unit tests for speed)
RUN mvn package -DskipTests=true


# =========================================================
# Stage 2: Packaging Phase
# =========================================================
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Configure execution parameters
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV PORT=8080

# Create low-privilege group & user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built artifacts from stage 1
COPY --from=builder /app/target/*.jar app.jar

# Expose microservice REST port
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
