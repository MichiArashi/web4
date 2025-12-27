package com.lab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Проверяет доступность базы данных при старте приложения
 */
@Component
@Order(1)
public class DatabaseHealthCheck implements CommandLineRunner {

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Override
    public void run(String... args) {
        if (dbUrl == null || dbUrl.isEmpty()) {
            System.out.println("⚠ База данных не настроена");
            return;
        }

        try {
            // Быстрая проверка подключения (таймаут 3 секунды)
            String testUrl = dbUrl
                .replaceAll("connectTimeout=\\d+", "connectTimeout=3")
                .replaceAll("socketTimeout=\\d+", "socketTimeout=3")
                .replaceAll("loginTimeout=\\d+", "loginTimeout=3");
            
            Connection conn = DriverManager.getConnection(testUrl, dbUsername, dbPassword);
            conn.close();
            
            if (dbUrl.contains("postgresql")) {
                System.out.println("✓ PostgreSQL подключен успешно");
            } else if (dbUrl.contains("h2")) {
                System.out.println("✓ H2 база данных инициализирована");
            }
        } catch (Exception e) {
            System.err.println("✗ Ошибка подключения к базе данных: " + e.getMessage());
            System.err.println("  URL: " + dbUrl);
            System.err.println("  Убедитесь, что база данных запущена и доступна");
            System.err.println("  Для использования H2 in-memory базы раскомментируйте H2 настройки в application.properties");
            // Не прерываем запуск - Spring Boot сам обработает ошибку
        }
    }
}

