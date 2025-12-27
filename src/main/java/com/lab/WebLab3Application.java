package com.lab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebLab3Application {
    public static void main(String[] args) {
        try {
            SpringApplication.run(WebLab3Application.class, args);
        } catch (Exception e) {

            if (e.getMessage() != null && (
                e.getMessage().contains("DataSource") || 
                e.getMessage().contains("Connection") ||
                e.getMessage().contains("JDBC") ||
                e.getMessage().contains("HikariPool"))) {
                System.err.println("\n" + "=".repeat(60));
                System.err.println("ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ");
                System.err.println("=".repeat(60));
                System.err.println("PostgreSQL недоступен. Для использования H2 in-memory базы:");
                System.err.println("1. Откройте src/main/resources/application.properties");
                System.err.println("2. Закомментируйте строки PostgreSQL (строки 7-10)");
                System.err.println("3. Раскомментируйте строки H2 (строки 13-16)");
                System.err.println("4. Перезапустите приложение");
                System.err.println("=".repeat(60) + "\n");
            }
            throw e;
        }
    }
}

