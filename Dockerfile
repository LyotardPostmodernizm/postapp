# Multi-stage Dockerfile for full-stack application

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/fe

# Copy frontend package files
COPY fe/package*.json ./
RUN npm install

# Copy environment files
COPY fe/.env* ./

# Copy frontend source and build
COPY fe/ ./

# Production build - VITE_API_URL boş olacak (same origin)
ENV NODE_ENV=production
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: Build Spring Boot backend
FROM maven:3.9.8-eclipse-temurin-21 AS backend-builder
WORKDIR /app/be

# Copy Maven wrapper files
COPY be/pom.xml ./
COPY be/.mvn/ ./.mvn/
COPY be/mvnw* ./

# Maven wrapper permission
RUN chmod +x mvnw || true

# Download dependencies
RUN ./mvnw dependency:go-offline -B || mvn dependency:go-offline -B

# Copy backend source and build
COPY be/src/ ./src/
RUN ./mvnw clean package -DskipTests -B || mvn clean package -DskipTests -B

# Stage 3: Runtime
FROM openjdk:21-jdk-slim
WORKDIR /app

# Timezone setting
ENV TZ=Europe/Istanbul

# Install nginx
RUN apt-get update && \
    apt-get install -y nginx curl tzdata && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy built frontend
COPY --from=frontend-builder /app/fe/dist /usr/share/nginx/html

# Copy built backend JAR
COPY --from=backend-builder /app/be/target/*.jar app.jar

# Copy configurations
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/api/health || exit 1

CMD ["/app/start.sh"]