/**
 * InputValidator - Frontend validation utility
 * 
 * Provides consistent validation for username and password across the application,
 * preventing code duplication and making it easy to update validation rules.
 * Works in sync with backend InputValidator.java
 */

const InputValidator = {
    // Validation constants (must match backend)
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 255,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 255,

    /**
     * Validates username for security and format
     * @param {string} username - The username to validate
     * @returns {object} { valid: boolean, error: string }
     */
    validateUsername(username) {
        // Check for null or empty
        if (!username || username.trim() === '') {
            return { valid: false, error: 'Username is required.' };
        }

        // Check length
        if (username.length < this.MIN_USERNAME_LENGTH) {
            return { valid: false, error: `Username must be at least ${this.MIN_USERNAME_LENGTH} characters.` };
        }
        if (username.length > this.MAX_USERNAME_LENGTH) {
            return { valid: false, error: `Username must not exceed ${this.MAX_USERNAME_LENGTH} characters.` };
        }

        // Check for dangerous characters (alphanumeric, underscores, hyphens only)
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens.' };
        }

        // Check for SQL injection patterns
        const dangerousPatterns = ["'", '"', ';', '--', '/*', '*/', 'xp_', 'sp_'];
        const lowerUsername = username.toLowerCase();
        for (let pattern of dangerousPatterns) {
            if (lowerUsername.includes(pattern)) {
                return { valid: false, error: 'Username contains invalid characters.' };
            }
        }

        // Check for SQL keywords that shouldn't be in usernames
        const sqlKeywords = ['union', 'select', 'insert', 'update', 'delete', 'drop', 
                            'create', 'alter', 'exec', 'execute', 'script', 'drop'];
        for (let keyword of sqlKeywords) {
            if (lowerUsername.includes(keyword)) {
                return { valid: false, error: 'Username contains invalid keywords.' };
            }
        }

        return { valid: true, error: '' };
    },

    /**
     * Validates password for security and format
     * @param {string} password - The password to validate
     * @returns {object} { valid: boolean, error: string }
     */
    validatePassword(password) {
        // Check for null or empty
        if (!password) {
            return { valid: false, error: 'Password is required.' };
        }

        // Check if password is just spaces
        if (password.trim() === '') {
            return { valid: false, error: 'Password cannot be just spaces.' };
        }

        // Check length
        if (password.length < this.MIN_PASSWORD_LENGTH) {
            return { valid: false, error: `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters.` };
        }
        if (password.length > this.MAX_PASSWORD_LENGTH) {
            return { valid: false, error: `Password must not exceed ${this.MAX_PASSWORD_LENGTH} characters.` };
        }

        return { valid: true, error: '' };
    },

    /**
     * Validates that two passwords match
     * @param {string} password - The password
     * @param {string} confirmPassword - The confirmation password
     * @returns {object} { valid: boolean, error: string }
     */
    validatePasswordMatch(password, confirmPassword) {
        if (password !== confirmPassword) {
            return { valid: false, error: 'Passwords do not match.' };
        }

        return { valid: true, error: '' };
    },

    /**
     * Validates username and password together
     * @param {string} username - The username
     * @param {string} password - The password
     * @returns {object} { valid: boolean, error: string }
     */
    validateCredentials(username, password) {
        // Validate username
        let result = this.validateUsername(username);
        if (!result.valid) {
            return result;
        }

        // Validate password
        result = this.validatePassword(password);
        if (!result.valid) {
            return result;
        }

        return { valid: true, error: '' };
    }
};
