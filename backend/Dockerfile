# Multi-stage build for Spring Boot on Render (Java 21)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build JAR with skipTests
RUN mvn clean package -DskipTests

# Runtime container (Lightweight Java 21 JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Fast JVM boot optimizations for Render
ENV JAVA_OPTS="-XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Xms256m -Xmx400m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
