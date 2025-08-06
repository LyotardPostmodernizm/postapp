
# Multi-stage Dockerfile for full-stack application

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/fe

# Copy frontend package files
COPY fe/package*.json ./
RUN npm ci --only=production

# Copy frontend source and build
COPY fe/ ./
RUN npm run build

# Stage 2: Build Spring Boot backend
FROM maven:3.9-openjdk-21-slim AS backend-builder
WORKDIR /app/be

# Copy Maven wrapper files (eğer varsa)
COPY be/pom.xml ./
COPY be/.mvn/ ./.mvn/
COPY be/mvnw* ./

# Maven wrapper'a execute permission ver
RUN chmod +x mvnw || true

# Download dependencies
RUN ./mvnw dependency:go-offline -B || mvn dependency:go-offline -B

# Copy backend source and build
COPY be/src/ ./src/
RUN ./mvnw clean package -DskipTests -B || mvn clean package -DskipTests -B

# Stage 3: Runtime
FROM openjdk:21-jdk-slim
WORKDIR /app

# Install nginx for serving frontend
RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy built frontend to nginx directory
COPY --from=frontend-builder /app/fe/dist /usr/share/nginx/html

# Copy built backend JAR
COPY --from=backend-builder /app/be/target/*.jar app.jar

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/start.sh /app/start.sh

RUN chmod +x /app/start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/api/health || exit 1

# Start the application
CMD ["/app/start.sh"]
