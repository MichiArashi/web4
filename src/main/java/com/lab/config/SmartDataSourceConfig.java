package com.lab.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.concurrent.TimeUnit;

@Configuration
public class SmartDataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {

        if (configuredUrl == null || configuredUrl.isEmpty()) {
            return createH2DataSource();
        }


        if (configuredUrl.contains("postgresql")) {
            if (isPostgreSQLAvailable()) {
                System.out.println("✓ PostgreSQL доступен, используем PostgreSQL");
                return createPostgreSQLDataSource();
            } else {
                System.out.println("⚠ PostgreSQL недоступен, переключаемся на H2 in-memory");
                return createH2DataSource();
            }
        }


        if (configuredUrl.contains("h2")) {
            return createH2DataSource();
        }


        return createPostgreSQLDataSource();
    }

    private boolean isPostgreSQLAvailable() {
        try {
            String testUrl = configuredUrl
                .replaceAll("connectTimeout=\\d+", "connectTimeout=3")
                .replaceAll("socketTimeout=\\d+", "socketTimeout=3")
                .replaceAll("loginTimeout=\\d+", "loginTimeout=3");
            
            Connection conn = DriverManager.getConnection(testUrl, configuredUsername, configuredPassword);
            conn.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private DataSource createPostgreSQLDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(configuredUrl);
        config.setUsername(configuredUsername);
        config.setPassword(configuredPassword);
        config.setDriverClassName("org.postgresql.Driver");
        config.setConnectionTimeout(5000);
        config.setMaximumPoolSize(5);
        config.setInitializationFailTimeout(1); // Не прерывать запуск
        return new HikariDataSource(config);
    }

    private DataSource createH2DataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:h2:mem:weblab3;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        config.setUsername("sa");
        config.setPassword("");
        config.setDriverClassName("org.h2.Driver");
        config.setConnectionTimeout(5000);
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }
}

