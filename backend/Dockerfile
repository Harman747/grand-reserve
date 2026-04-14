# Use Maven + Java 17
FROM maven:3.9.9-eclipse-temurin-17

# Set working directory
WORKDIR /app

# Copy everything from backend
COPY . .

# Build the Spring Boot app
RUN mvn clean package -DskipTests

# Expose port (Render provides PORT env)
EXPOSE 8080

# Run the jar
CMD ["sh", "-c", "java -jar target/grand-reserve-backend-1.0.0.jar --server.port=${PORT:-8080}"]
