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

# Copy Maven files for dependency caching
COPY be/pom.xml ./
COPY be/.mvn ./.mvn
COPY be/mvnw ./
COPY be/mvnw.cmd ./

# Download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy backend source and build
COPY be/src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 3: Runtime
FROM openjdk:21-jdk-slim
WORKDIR /app

# Install nginx for serving frontend
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy built frontend to nginx directory
COPY --from=frontend-builder /app/fe/dist /usr/share/nginx/html

# Copy built backend JAR
COPY --from=backend-builder /app/be/target/*.jar app.jar

# Copy nginx configuration
COPY <<EOF /etc/nginx/sites-available/default
server {
    listen 80;
    server_name localhost;

    # Serve React app
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/bash
# Start nginx in background
service nginx start

# Start Spring Boot application
java -jar app.jar
EOF

RUN chmod +x /app/start.sh

# Expose port (Render.com will use the PORT environment variable)
EXPOSE \${PORT:-8080}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/api/health || exit 1

# Start the application
CMD ["/app/start.sh"]