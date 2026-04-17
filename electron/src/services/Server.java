package services;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;


import database.DatabaseConnection;

public class Server {
    private static final int PORT = 8080;
    private static AuthService authService = new AuthService();
    private static RentalService rentalService = new RentalService();
    private static ReviewService reviewService = new ReviewService();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Register endpoint handlers
        server.createContext("/register", new RegisterHandler());
        server.createContext("/login", new LoginHandler());
        server.createContext("/addRental", new AddRentalHandler());
        server.createContext("/search", new SearchHandler());
        server.createContext("/review", new ReviewHandler());

        server.setExecutor(null); // use default executor
        server.start();

        System.out.println("✓ Server started on http://localhost:" + PORT);
        System.out.println("  POST /register - Register a new user");
        System.out.println("  POST /login - Login an existing user");
    }

    // Handler for POST /register
    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Handle CORS preflight
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsResponse(exchange, 204, "");
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String requestBody = readRequestBody(exchange);
                    String username = extractJsonValue(requestBody, "username");
                    String password = extractJsonValue(requestBody, "password");

                    // Validate credentials using centralized validator
                    InputValidator.ValidationResult validationResult = 
                        InputValidator.validateCredentials(username, password);
                    
                    if (!validationResult.isValid()) {
                        System.out.println("✗ Invalid input attempt: " + validationResult.getErrorMessage());
                        sendJsonResponse(exchange, 400, 
                            "{\"success\": false, \"error\": \"" + escapeJson(validationResult.getErrorMessage()) + "\"}");
                        return;
                    }

                    // Register user
                    boolean success = authService.registerUser(username, password);

                    if (success) {
                        System.out.println("✓ User registered: " + username);
                        sendJsonResponse(exchange, 200, 
                            "{\"success\": true, \"message\": \"User registered successfully.\"}");
                    } else {
                        System.out.println("✗ Registration failed for user: " + username);
                        sendJsonResponse(exchange, 400, 
                            "{\"success\": false, \"error\": \"Registration failed. Username may already exist.\"}");
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                    sendJsonResponse(exchange, 500, 
                        "{\"success\": false, \"error\": \"Server error: " + escapeJson(e.getMessage()) + "\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\": \"Method not allowed.\"}");
            }
        }
    }

    // Handler for POST /login
    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Handle CORS preflight
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCorsResponse(exchange, 204, "");
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String requestBody = readRequestBody(exchange);
                    String username = extractJsonValue(requestBody, "username");
                    String password = extractJsonValue(requestBody, "password");

                    // Validate credentials using centralized validator
                    InputValidator.ValidationResult validationResult = 
                        InputValidator.validateCredentials(username, password);
                    
                    if (!validationResult.isValid()) {
                        System.out.println("✗ Invalid login attempt: " + validationResult.getErrorMessage());
                        sendJsonResponse(exchange, 400, 
                            "{\"success\": false, \"error\": \"" + escapeJson(validationResult.getErrorMessage()) + "\"}");
                        return;
                    }

                    // Authenticate user
                    boolean authenticated = authenticateUser(username, password);

                    if (authenticated) {
                        System.out.println("✓ User logged in: " + username);
                        sendJsonResponse(exchange, 200, 
                            "{\"success\": true, \"message\": \"Login successful.\"}");
                    } else {
                        System.out.println("✗ Login failed for user: " + username);
                        sendJsonResponse(exchange, 401, 
                            "{\"success\": false, \"error\": \"Invalid username or password.\"}");
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                    sendJsonResponse(exchange, 500, 
                        "{\"success\": false, \"error\": \"Server error: " + escapeJson(e.getMessage()) + "\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\": \"Method not allowed.\"}");
            }
        }
    }
    static class AddRentalHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {

                String body = readRequestBody(exchange);

                models.RentalUnit rental = new models.RentalUnit(
                    extractJsonValue(body, "username"),
                    extractJsonValue(body, "title"),
                    extractJsonValue(body, "description"),
                    extractJsonValue(body, "feature"),
                    Integer.parseInt(extractJsonValue(body, "price"))
                );

                boolean success = rentalService.addRental(rental);

                if (success)
                    sendJsonResponse(exchange, 200, "{\"success\":true}");
                else
                    sendJsonResponse(exchange, 400, "{\"error\":\"Limit reached or failed\"}");
            }
        }
    }

    static class SearchHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {

                String query = exchange.getRequestURI().getQuery();
                String feature = query.split("=")[1];

                String sql = "SELECT * FROM rental_unit WHERE feature LIKE ?";

                try (Connection conn = DatabaseConnection.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(sql)) {

                    stmt.setString(1, "%" + feature + "%");
                    ResultSet rs = stmt.executeQuery();

                    StringBuilder result = new StringBuilder("[");
                    boolean first = true;

                    while (rs.next()) {
                        if (!first) result.append(",");
                        first = false;

                        result.append("{\"id\":").append(rs.getInt("id"))
                              .append(",\"title\":\"").append(rs.getString("title")).append("\"}");
                    }

                    result.append("]");
                    sendJsonResponse(exchange, 200, result.toString());
                } catch (Exception e) {
                    sendJsonResponse(exchange, 500, "{\"error\":\"Search failed\"}");
                }
            }
        }
    }

    static class ReviewHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {

                String body = readRequestBody(exchange);

                models.Review review = new models.Review(
                    Integer.parseInt(extractJsonValue(body, "rental_id")),
                    extractJsonValue(body, "username"),
                    extractJsonValue(body, "rating"),
                    extractJsonValue(body, "comment")
                );

                boolean success = reviewService.addReview(review);

                if (success)
                    sendJsonResponse(exchange, 200, "{\"success\":true}");
                else
                    sendJsonResponse(exchange, 400, "{\"error\":\"Review failed\"}");
            }
        }
    }


    // Authenticate user by checking username and password against database
    private static boolean authenticateUser(String username, String password) {
        // Hash the provided password
        String hashedPassword = hashPassword(password);

        String sql = "SELECT password FROM user WHERE username = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                String storedHash = rs.getString("password");
                // Compare hashed password with stored hash
                return storedHash.equals(hashedPassword);
            }

            return false;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Hash password using SHA-256 (same as AuthService)
    private static String hashPassword(String password) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hashed = md.digest(password.getBytes());

            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();

        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // Helper: Read request body as string
    private static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    // Helper: Extract value from JSON string manually (no external JSON library needed)
    private static String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) {
            return null;
        }
        startIndex += searchKey.length();

        // Find the opening quote
        int quoteIndex = json.indexOf("\"", startIndex);
        if (quoteIndex == -1) {
            return null;
        }

        // Find the closing quote
        int endIndex = json.indexOf("\"", quoteIndex + 1);
        if (endIndex == -1) {
            return null;
        }

        return json.substring(quoteIndex + 1, endIndex);
    }

    // Helper: Escape special characters for JSON string
    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    // Helper: Send JSON response with CORS headers
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String responseBody) throws IOException {
        sendCorsResponse(exchange, statusCode, responseBody);
    }

    // Helper: Send response with CORS headers
    private static void sendCorsResponse(HttpExchange exchange, int statusCode, String responseBody) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

        byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
