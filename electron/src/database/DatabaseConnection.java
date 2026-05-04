package database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class DatabaseConnection {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String URL = dotenv.get("DB_URL");
    private static final String USER = dotenv.get("DB_USER");
    private static final String PASSWORD = dotenv.get("DB_PASSWORD");

    private static Connection connection;

    public static Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connect();
        }
        return connection;
    }

    private static void connect() throws SQLException {
        // Validate that .env values are loaded
        if (URL == null || USER == null || PASSWORD == null) {
            throw new SQLException("Missing .env variables: DB_URL, DB_USER, or DB_PASSWORD not found. " +
                "Make sure .env file exists in the project root with these values.");
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC Driver not found.", e);
        }

        System.out.println("Connecting to database: " + URL);
        connection = DriverManager.getConnection(URL, USER, PASSWORD);
        System.out.println("Database connection successful!");
    }

    public static void close() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (SQLException ignored) {}
    }
}