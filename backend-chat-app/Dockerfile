FROM amazoncorretto:21-alpine
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests
RUN cp $(ls target/*.jar | head -n 1) app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
