package services;

/**
 * InputValidator - Centralized input validation for security and data integrity
 * 
 * This class provides validation methods to prevent:
 * - SQL Injection
 * - XSS attacks
 * - Invalid input formats
 * - Empty/null values
 */
public class InputValidator {

    // Constants for validation
    private static final int MIN_USERNAME_LENGTH = 3;
    private static final int MAX_USERNAME_LENGTH = 255;
    private static final int MIN_PASSWORD_LENGTH = 6;
    private static final int MAX_PASSWORD_LENGTH = 255;

    /**
     * Validates username for security and format
     * - No SQL injection characters
     * - No XSS attempts
     * - Valid length
     * - Alphanumeric with underscores/hyphens only
     * 
     * @param username The username to validate
     * @return ValidationResult with success status and error message
     */
    public static ValidationResult validateUsername(String username) {
        // Check for null or empty
        if (username == null || username.trim().isEmpty()) {
            return new ValidationResult(false, "Username is required.");
        }

        // Check length
        if (username.length() < MIN_USERNAME_LENGTH) {
            return new ValidationResult(false, "Username must be at least " + MIN_USERNAME_LENGTH + " characters.");
        }
        if (username.length() > MAX_USERNAME_LENGTH) {
            return new ValidationResult(false, "Username must not exceed " + MAX_USERNAME_LENGTH + " characters.");
        }

        // Check for dangerous characters (SQL injection, XSS attempts)
        if (!username.matches("^[a-zA-Z0-9_-]+$")) {
            return new ValidationResult(false, "Username can only contain letters, numbers, underscores, and hyphens.");
        }

        // Additional checks for common SQL injection patterns
        String lowerUsername = username.toLowerCase();
        if (lowerUsername.contains("'") || lowerUsername.contains("\"") || 
            lowerUsername.contains(";") || lowerUsername.contains("--") ||
            lowerUsername.contains("/*") || lowerUsername.contains("*/") ||
            lowerUsername.contains("xp_") || lowerUsername.contains("sp_")) {
            return new ValidationResult(false, "Username contains invalid characters.");
        }

        // Check for SQL keyword injection attempts
        String[] sqlKeywords = {"union", "select", "insert", "update", "delete", "drop", 
                               "create", "alter", "exec", "execute", "script"};
        for (String keyword : sqlKeywords) {
            if (lowerUsername.contains(keyword)) {
                return new ValidationResult(false, "Username contains invalid keywords.");
            }
        }

        return new ValidationResult(true, "");
    }

    /**
     * Validates password for security and format
     * - Minimum length requirement
     * - Not just spaces
     * - No obviously dangerous patterns
     * 
     * @param password The password to validate
     * @return ValidationResult with success status and error message
     */
    public static ValidationResult validatePassword(String password) {
        // Check for null or empty
        if (password == null || password.isEmpty()) {
            return new ValidationResult(false, "Password is required.");
        }

        // Check if password is just spaces
        if (password.trim().isEmpty()) {
            return new ValidationResult(false, "Password cannot be just spaces.");
        }

        // Check length
        if (password.length() < MIN_PASSWORD_LENGTH) {
            return new ValidationResult(false, "Password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }
        if (password.length() > MAX_PASSWORD_LENGTH) {
            return new ValidationResult(false, "Password must not exceed " + MAX_PASSWORD_LENGTH + " characters.");
        }

        return new ValidationResult(true, "");
    }

    /**
     * Validates that two passwords match
     * 
     * @param password The password
     * @param confirmPassword The confirmation password
     * @return ValidationResult with success status and error message
     */
    public static ValidationResult validatePasswordMatch(String password, String confirmPassword) {
        if (password == null || confirmPassword == null) {
            return new ValidationResult(false, "Passwords cannot be null.");
        }

        if (!password.equals(confirmPassword)) {
            return new ValidationResult(false, "Passwords do not match.");
        }

        return new ValidationResult(true, "");
    }

    /**
     * Validates username and password together
     * 
     * @param username The username
     * @param password The password
     * @return ValidationResult with success status and error message
     */
    public static ValidationResult validateCredentials(String username, String password) {
        ValidationResult usernameResult = validateUsername(username);
        if (!usernameResult.isValid()) {
            return usernameResult;
        }

        ValidationResult passwordResult = validatePassword(password);
        if (!passwordResult.isValid()) {
            return passwordResult;
        }

        return new ValidationResult(true, "");
    }

    /**
     * Helper class to return validation results
     */
    public static class ValidationResult {
        private boolean valid;
        private String errorMessage;

        public ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
