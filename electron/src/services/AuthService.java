package services;

import database.DatabaseConnection;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AuthService {

    //Registers a new user by inserting into MySQL using prepared statements.
    public RegistrationResult registerUser(String username, String password, String firstName, String lastName, String email, String phone) {
        String duplicateError = findDuplicateError(username, email, phone);
        if (duplicateError != null) {
            return RegistrationResult.failure(duplicateError);
        }

        String hashedPassword = hashPassword(password);

        String sql = "INSERT INTO user (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, hashedPassword);
            stmt.setString(3, firstName);
            stmt.setString(4, lastName);
            stmt.setString(5, email);
            stmt.setString(6, phone);

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                return RegistrationResult.success();
            }

            return RegistrationResult.failure("Registration failed.");

        } catch (SQLException e) {
            String duplicateFromConstraint = mapDuplicateConstraintError(e.getMessage());
            if (duplicateFromConstraint != null) {
                return RegistrationResult.failure(duplicateFromConstraint);
            }
            return RegistrationResult.failure("Registration failed due to a database error.");
        }
    }

    private String findDuplicateError(String username, String email, String phone) {
        String sql = "SELECT username, email, phone FROM user WHERE username = ? OR email = ? OR phone = ? LIMIT 1";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, email);
            stmt.setString(3, phone);

            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                if (username.equals(rs.getString("username"))) {
                    return "Username is already taken.";
                }
                if (email.equals(rs.getString("email"))) {
                    return "Email is already in use.";
                }
                if (phone.equals(rs.getString("phone"))) {
                    return "Phone number is already in use.";
                }
            }
        } catch (SQLException e) {
            return "Unable to validate unique fields right now.";
        }

        return null;
    }

    private String mapDuplicateConstraintError(String dbMessage) {
        if (dbMessage == null) {
            return null;
        }

        String message = dbMessage.toLowerCase();
        if (!message.contains("duplicate")) {
            return null;
        }

        if (message.contains("primary") || message.contains("username")) {
            return "Username is already taken.";
        }
        if (message.contains("email")) {
            return "Email is already in use.";
        }
        if (message.contains("phone")) {
            return "Phone number is already in use.";
        }

        return "A unique field already exists.";
    }

    public static class RegistrationResult {
        private final boolean success;
        private final String errorMessage;

        private RegistrationResult(boolean success, String errorMessage) {
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static RegistrationResult success() {
            return new RegistrationResult(true, "");
        }

        public static RegistrationResult failure(String errorMessage) {
            return new RegistrationResult(false, errorMessage);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    // Hashes the password using SHA‑256.
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashed = md.digest(password.getBytes());

            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}