// Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
package services;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import database.DatabaseConnection;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.concurrent.Executor;
import models.RentalUnit;
import models.Review;

public class Server {
   private static final int PORT = 8080;
   private static AuthService authService = new AuthService();
   private static RentalService rentalService = new RentalService();
   private static ReviewService reviewService = new ReviewService();

   public Server() {
   }

   public static void main(String[] var0) throws IOException {
      HttpServer var1 = HttpServer.create(new InetSocketAddress(8080), 0);
      var1.createContext("/register", new RegisterHandler());
      var1.createContext("/login", new LoginHandler());
      var1.createContext("/addRental", new AddRentalHandler());
      var1.createContext("/search", new SearchHandler());
      var1.createContext("/review", new ReviewHandler());
      var1.createContext("/searchTwoFeatures", new SearchTwoFeaturesHandler());
      var1.createContext("/highRatedRentals", new HighRatedRentalsHandler());
      var1.createContext("/topPosters", new TopPostersHandler());
      var1.createContext("/usersPoorOnly", new UsersPoorOnlyHandler());
      var1.createContext("/usersNoPoor", new UsersNoPoorHandler());
      var1.setExecutor((Executor)null);
      var1.start();
      System.out.println("✓ Server started on http://localhost:8080");
      System.out.println("  POST /register - Register a new user");
      System.out.println("  POST /login - Login an existing user");
   }

   private static boolean authenticateUser(String var0, String var1) {
      String var2 = hashPassword(var1);
      String var3 = "SELECT password FROM user WHERE username = ?";

      try {
         Connection var4 = DatabaseConnection.getConnection();

         boolean var8;
         label80: {
            boolean var14;
            try {
               PreparedStatement var5 = var4.prepareStatement(var3);

               label82: {
                  try {
                     var5.setString(1, var0);
                     ResultSet var6 = var5.executeQuery();
                     if (!var6.next()) {
                        var14 = false;
                        break label82;
                     }

                     String var7 = var6.getString("password");
                     var8 = var7.equals(var2);
                  } catch (Throwable var11) {
                     if (var5 != null) {
                        try {
                           var5.close();
                        } catch (Throwable var10) {
                           var11.addSuppressed(var10);
                        }
                     }

                     throw var11;
                  }

                  if (var5 != null) {
                     var5.close();
                  }
                  break label80;
               }

               if (var5 != null) {
                  var5.close();
               }
            } catch (Throwable var12) {
               if (var4 != null) {
                  try {
                     var4.close();
                  } catch (Throwable var9) {
                     var12.addSuppressed(var9);
                  }
               }

               throw var12;
            }

            if (var4 != null) {
               var4.close();
            }

            return var14;
         }

         if (var4 != null) {
            var4.close();
         }

         return var8;
      } catch (SQLException var13) {
         var13.printStackTrace();
         return false;
      }
   }

   private static String hashPassword(String var0) {
      try {
         MessageDigest var1 = MessageDigest.getInstance("SHA-256");
         byte[] var2 = var1.digest(var0.getBytes());
         StringBuilder var3 = new StringBuilder();

         for(byte var7 : var2) {
            var3.append(String.format("%02x", var7));
         }

         return var3.toString();
      } catch (NoSuchAlgorithmException var8) {
         throw new RuntimeException("Error hashing password", var8);
      }
   }

   private static String readRequestBody(HttpExchange var0) throws IOException {
      InputStream var1 = var0.getRequestBody();
      BufferedReader var2 = new BufferedReader(new InputStreamReader(var1, StandardCharsets.UTF_8));
      StringBuilder var3 = new StringBuilder();

      String var4;
      while((var4 = var2.readLine()) != null) {
         var3.append(var4);
      }

      return var3.toString();
   }

   private static String extractJsonValue(String var0, String var1) {
      String var2 = "\"" + var1 + "\":";
      int var3 = var0.indexOf(var2);
      if (var3 == -1) {
         return null;
      } else {
         var3 += var2.length();
         int var4 = var0.indexOf("\"", var3);
         if (var4 == -1) {
            return null;
         } else {
            int var5 = var0.indexOf("\"", var4 + 1);
            return var5 == -1 ? null : var0.substring(var4 + 1, var5);
         }
      }
   }

   private static String escapeJson(String var0) {
      return var0 == null ? "" : var0.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
   }

   private static void sendJsonResponse(HttpExchange var0, int var1, String var2) throws IOException {
      sendCorsResponse(var0, var1, var2);
   }

   private static void sendCorsResponse(HttpExchange var0, int var1, String var2) throws IOException {
      var0.getResponseHeaders().set("Content-Type", "application/json");
      var0.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
      var0.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      var0.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
      byte[] var3 = var2.getBytes(StandardCharsets.UTF_8);
      var0.sendResponseHeaders(var1, (long)var3.length);
      OutputStream var4 = var0.getResponseBody();
      var4.write(var3);
      var4.close();
   }

   static class RegisterHandler implements HttpHandler {
      RegisterHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("OPTIONS".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendCorsResponse(var1, 204, "");
         } else {
            if ("POST".equalsIgnoreCase(var1.getRequestMethod())) {
               try {
                  String var2 = Server.readRequestBody(var1);
                  String var3 = Server.extractJsonValue(var2, "username");
                  String var4 = Server.extractJsonValue(var2, "password");
                  String var5 = Server.extractJsonValue(var2, "firstName");
                  String var6 = Server.extractJsonValue(var2, "lastName");
                  String var7 = Server.extractJsonValue(var2, "email");
                  String var8 = Server.extractJsonValue(var2, "phoneNumber");
                  InputValidator.ValidationResult var9 = InputValidator.validateRegistrationData(var3, var4, var5, var6, var7, var8);
                  if (!var9.isValid()) {
                     System.out.println("✗ Invalid input attempt: " + var9.getErrorMessage());
                     Server.sendJsonResponse(var1, 400, "{\"success\": false, \"error\": \"" + Server.escapeJson(var9.getErrorMessage()) + "\"}");
                     return;
                  }

                  AuthService.RegistrationResult var10 = Server.authService.registerUser(var3, var4, var5, var6, var7, var8);
                  if (var10.isSuccess()) {
                     System.out.println("✓ User registered: " + var3);
                     Server.sendJsonResponse(var1, 200, "{\"success\": true, \"message\": \"User registered successfully.\"}");
                  } else {
                     System.out.println("✗ Registration failed for user: " + var3);
                     Server.sendJsonResponse(var1, 400, "{\"success\": false, \"error\": \"" + Server.escapeJson(var10.getErrorMessage()) + "\"}");
                  }
               } catch (Exception var11) {
                  var11.printStackTrace();
                  Server.sendJsonResponse(var1, 500, "{\"success\": false, \"error\": \"Server error: " + Server.escapeJson(var11.getMessage()) + "\"}");
               }
            } else {
               Server.sendJsonResponse(var1, 405, "{\"error\": \"Method not allowed.\"}");
            }

         }
      }
   }

   static class LoginHandler implements HttpHandler {
      LoginHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("OPTIONS".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendCorsResponse(var1, 204, "");
         } else {
            if ("POST".equalsIgnoreCase(var1.getRequestMethod())) {
               try {
                  String var2 = Server.readRequestBody(var1);
                  String var3 = Server.extractJsonValue(var2, "username");
                  String var4 = Server.extractJsonValue(var2, "password");
                  InputValidator.ValidationResult var5 = InputValidator.validateCredentials(var3, var4);
                  if (!var5.isValid()) {
                     System.out.println("✗ Invalid login attempt: " + var5.getErrorMessage());
                     Server.sendJsonResponse(var1, 400, "{\"success\": false, \"error\": \"" + Server.escapeJson(var5.getErrorMessage()) + "\"}");
                     return;
                  }

                  boolean var6 = Server.authenticateUser(var3, var4);
                  if (var6) {
                     System.out.println("User logged in: " + var3);
                     Server.sendJsonResponse(var1, 200, "{\"success\": true, \"message\": \"Login successful.\"}");
                  } else {
                     System.out.println("Login failed for user: " + var3);
                     Server.sendJsonResponse(var1, 401, "{\"success\": false, \"error\": \"Invalid username or password.\"}");
                  }
               } catch (Exception var7) {
                  var7.printStackTrace();
                  Server.sendJsonResponse(var1, 500, "{\"success\": false, \"error\": \"Server error: " + Server.escapeJson(var7.getMessage()) + "\"}");
               }
            } else {
               Server.sendJsonResponse(var1, 405, "{\"error\": \"Method not allowed.\"}");
            }

         }
      }
   }

   static class AddRentalHandler implements HttpHandler {
      AddRentalHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("POST".equalsIgnoreCase(var1.getRequestMethod())) {
            String var2 = Server.readRequestBody(var1);
            RentalUnit var3 = new RentalUnit(Server.extractJsonValue(var2, "username"), Server.extractJsonValue(var2, "title"), Server.extractJsonValue(var2, "description"), Server.extractJsonValue(var2, "feature"), Integer.parseInt(Server.extractJsonValue(var2, "price")));
            boolean var4 = Server.rentalService.addRental(var3);
            if (var4) {
               Server.sendJsonResponse(var1, 200, "{\"success\":true}");
            } else {
               Server.sendJsonResponse(var1, 400, "{\"error\":\"Limit reached or failed\"}");
            }
         }

      }
   }

   static class SearchHandler implements HttpHandler {
      SearchHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("GET".equalsIgnoreCase(var1.getRequestMethod())) {
            String var2 = var1.getRequestURI().getQuery();
            String var3 = var2.split("=")[1];
            String var4 = "SELECT * FROM rental_unit WHERE feature LIKE ?";

            try {
               Connection var5 = DatabaseConnection.getConnection();

               try {
                  PreparedStatement var6 = var5.prepareStatement(var4);

                  try {
                     var6.setString(1, "%" + var3 + "%");
                     ResultSet var7 = var6.executeQuery();
                     StringBuilder var8 = new StringBuilder("[");
                     boolean var9 = true;

                     while(var7.next()) {
                        if (!var9) {
                           var8.append(",");
                        }

                        var9 = false;
                        var8.append("{\"id\":").append(var7.getInt("id")).append(",\"title\":\"").append(Server.escapeJson(var7.getString("title"))).append("\",\"description\":\"").append(Server.escapeJson(var7.getString("description"))).append("\",\"price\":").append(var7.getInt("price")).append(",\"username\":\"").append(Server.escapeJson(var7.getString("username"))).append("\"}");
                     }

                     var8.append("]");
                     Server.sendJsonResponse(var1, 200, var8.toString());
                  } catch (Throwable var12) {
                     if (var6 != null) {
                        try {
                           var6.close();
                        } catch (Throwable var11) {
                           var12.addSuppressed(var11);
                        }
                     }

                     throw var12;
                  }

                  if (var6 != null) {
                     var6.close();
                  }
               } catch (Throwable var13) {
                  if (var5 != null) {
                     try {
                        var5.close();
                     } catch (Throwable var10) {
                        var13.addSuppressed(var10);
                     }
                  }

                  throw var13;
               }

               if (var5 != null) {
                  var5.close();
               }
            } catch (Exception var14) {
               var14.printStackTrace();
               Server.sendJsonResponse(var1, 500, "{\"error\":\"Search failed\"}");
            }
         }

      }
   }

   static class SearchTwoFeaturesHandler implements HttpHandler {
      SearchTwoFeaturesHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if (!"GET".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendJsonResponse(var1, 405, "{\"error\":\"Method not allowed\"}");
         } else {
            try {
               String var2 = var1.getRequestURI().getQuery();
               if (var2 == null || !var2.contains("x=") || !var2.contains("y=")) {
                  Server.sendJsonResponse(var1, 400, "{\"error\":\"Missing feature parameters\"}");
                  return;
               }

               String[] var3 = var2.split("&");
               String var4 = var3[0].split("=")[1].toLowerCase();
               String var5 = var3[1].split("=")[1].toLowerCase();
               String var6 = "SELECT DISTINCT r1.username FROM rental_unit r1 JOIN rental_unit r2   ON r1.username = r2.username  AND DATE(r1.created_at) = DATE(r2.created_at) WHERE REPLACE(LOWER(r1.feature), ' ', '') LIKE CONCAT('%', ?, '%')  AND REPLACE(LOWER(r2.feature), ' ', '') LIKE CONCAT('%', ?, '%')  AND r1.id <> r2.id";
               Connection var7 = DatabaseConnection.getConnection();

               try {
                  PreparedStatement var8 = var7.prepareStatement(var6);

                  try {
                     var8.setString(1, var4);
                     var8.setString(2, var5);
                     ResultSet var9 = var8.executeQuery();
                     StringBuilder var10 = new StringBuilder("[");
                     boolean var11 = true;

                     while(var9.next()) {
                        if (!var11) {
                           var10.append(",");
                        }

                        var11 = false;
                        var10.append("{\"username\":\"").append(Server.escapeJson(var9.getString("username"))).append("\"}");
                     }

                     var10.append("]");
                     Server.sendJsonResponse(var1, 200, var10.toString());
                  } catch (Throwable var14) {
                     if (var8 != null) {
                        try {
                           var8.close();
                        } catch (Throwable var13) {
                           var14.addSuppressed(var13);
                        }
                     }

                     throw var14;
                  }

                  if (var8 != null) {
                     var8.close();
                  }
               } catch (Throwable var15) {
                  if (var7 != null) {
                     try {
                        var7.close();
                     } catch (Throwable var12) {
                        var15.addSuppressed(var12);
                     }
                  }

                  throw var15;
               }

               if (var7 != null) {
                  var7.close();
               }
            } catch (Exception var16) {
               var16.printStackTrace();
               Server.sendJsonResponse(var1, 500, "{\"error\":\"Server error\"}");
            }

         }
      }
   }

   static class ReviewHandler implements HttpHandler {
      ReviewHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("POST".equalsIgnoreCase(var1.getRequestMethod())) {
            String var2 = Server.readRequestBody(var1);
            Review var3 = new Review(Integer.parseInt(Server.extractJsonValue(var2, "rental_id")), Server.extractJsonValue(var2, "username"), Server.extractJsonValue(var2, "rating"), Server.extractJsonValue(var2, "comment"));
            boolean var4 = Server.reviewService.addReview(var3);
            if (var4) {
               Server.sendJsonResponse(var1, 200, "{\"success\":true}");
            } else {
               Server.sendJsonResponse(var1, 400, "{\"error\":\"Review failed\"}");
            }
         }

      }
   }

   static class HighRatedRentalsHandler implements HttpHandler {
      HighRatedRentalsHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if (!"GET".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendJsonResponse(var1, 405, "{\"error\":\"Method not allowed\"}");
         } else {
            String var2 = var1.getRequestURI().getQuery();
            String var3 = "";
            if (var2 != null) {
               for(String var7 : var2.split("&")) {
                  String[] var8 = var7.split("=");
                  if (var8.length == 2 && var8[0].equals("username")) {
                     var3 = URLDecoder.decode(var8[1], "UTF-8");
                  }
               }
            }

            String var15 = "    SELECT r.id, r.title, r.feature, r.price\n    FROM rental_unit r\n    WHERE r.username = ?\n    AND EXISTS (\n        SELECT 1 FROM review rv WHERE rv.rental_id = r.id\n    )\n    AND NOT EXISTS (\n          SELECT 1 FROM review rv\n          WHERE rv.rental_id = r.id\n            AND rv.rating NOT IN ('excellent', 'good')\n    )\n";
            StringBuilder var16 = new StringBuilder("[");

            try {
               Connection var17 = DatabaseConnection.getConnection();

               try {
                  PreparedStatement var18 = var17.prepareStatement(var15);

                  try {
                     var18.setString(1, var3);
                     ResultSet var19 = var18.executeQuery();

                     for(boolean var9 = true; var19.next(); var9 = false) {
                        if (!var9) {
                           var16.append(",");
                        }

                        var16.append(String.format("{\"id\":%d,\"title\":\"%s\",\"feature\":\"%s\",\"price\":%.2f}", var19.getInt("id"), var19.getString("title").replace("\"", "\\\""), var19.getString("feature").replace("\"", "\\\""), var19.getDouble("price")));
                     }
                  } catch (Throwable var12) {
                     if (var18 != null) {
                        try {
                           var18.close();
                        } catch (Throwable var11) {
                           var12.addSuppressed(var11);
                        }
                     }

                     throw var12;
                  }

                  if (var18 != null) {
                     var18.close();
                  }
               } catch (Throwable var13) {
                  if (var17 != null) {
                     try {
                        var17.close();
                     } catch (Throwable var10) {
                        var13.addSuppressed(var10);
                     }
                  }

                  throw var13;
               }

               if (var17 != null) {
                  var17.close();
               }
            } catch (Exception var14) {
               var14.printStackTrace();
            }

            var16.append("]");
            Server.sendJsonResponse(var1, 200, var16.toString());
         }
      }
   }

   static class TopPostersHandler implements HttpHandler {
      TopPostersHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if (!"GET".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendJsonResponse(var1, 405, "{\"error\":\"Method not allowed\"}");
         } else {
            String var2 = var1.getRequestURI().getQuery();
            String var3 = "";
            if (var2 != null) {
               for(String var7 : var2.split("&")) {
                  String[] var8 = var7.split("=");
                  if (var8.length == 2 && var8[0].equals("date")) {
                     var3 = URLDecoder.decode(var8[1], "UTF-8");
                  }
               }
            }

            String var15 = "    SELECT username, COUNT(*) AS total\n    FROM rental_unit\n    WHERE DATE(created_at) = ?\n    GROUP BY username\n    HAVING COUNT(*) = (\n        SELECT MAX(cnt) FROM (\n            SELECT COUNT(*) AS cnt\n            FROM rental_unit\n            WHERE DATE(created_at) = ?\n            GROUP BY username\n        ) AS sub\n    )\n";
            StringBuilder var16 = new StringBuilder("[");

            try {
               Connection var17 = DatabaseConnection.getConnection();

               try {
                  PreparedStatement var18 = var17.prepareStatement(var15);

                  try {
                     var18.setString(1, var3);
                     var18.setString(2, var3);
                     ResultSet var19 = var18.executeQuery();

                     for(boolean var9 = true; var19.next(); var9 = false) {
                        if (!var9) {
                           var16.append(",");
                        }

                        var16.append(String.format("{\"username\":\"%s\",\"total\":%d}", var19.getString("username").replace("\"", "\\\""), var19.getInt("total")));
                     }
                  } catch (Throwable var12) {
                     if (var18 != null) {
                        try {
                           var18.close();
                        } catch (Throwable var11) {
                           var12.addSuppressed(var11);
                        }
                     }

                     throw var12;
                  }

                  if (var18 != null) {
                     var18.close();
                  }
               } catch (Throwable var13) {
                  if (var17 != null) {
                     try {
                        var17.close();
                     } catch (Throwable var10) {
                        var13.addSuppressed(var10);
                     }
                  }

                  throw var13;
               }

               if (var17 != null) {
                  var17.close();
               }
            } catch (Exception var14) {
               var14.printStackTrace();
            }

            var16.append("]");
            Server.sendJsonResponse(var1, 200, var16.toString());
         }
      }
   }

   static class UsersPoorOnlyHandler implements HttpHandler {
      UsersPoorOnlyHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("OPTIONS".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendCorsResponse(var1, 204, "");
         } else if (!"GET".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendJsonResponse(var1, 405, "{\"error\":\"Method not allowed\"}");
         } else {
            String var2 = "    SELECT DISTINCT r.username\n    FROM review r\n    WHERE r.username IS NOT NULL\n    AND NOT EXISTS (\n        SELECT 1 FROM review r2\n        WHERE r2.username = r.username\n        AND r2.rating != 'poor'\n    )\n";
            StringBuilder var3 = new StringBuilder("[");

            try {
               Connection var4 = DatabaseConnection.getConnection();

               try {
                  PreparedStatement var5 = var4.prepareStatement(var2);

                  try {
                     ResultSet var6 = var5.executeQuery();

                     for(boolean var7 = true; var6.next(); var7 = false) {
                        if (!var7) {
                           var3.append(",");
                        }

                        var3.append("{\"username\":\"").append(Server.escapeJson(var6.getString("username"))).append("\"}");
                     }
                  } catch (Throwable var10) {
                     if (var5 != null) {
                        try {
                           var5.close();
                        } catch (Throwable var9) {
                           var10.addSuppressed(var9);
                        }
                     }

                     throw var10;
                  }

                  if (var5 != null) {
                     var5.close();
                  }
               } catch (Throwable var11) {
                  if (var4 != null) {
                     try {
                        var4.close();
                     } catch (Throwable var8) {
                        var11.addSuppressed(var8);
                     }
                  }

                  throw var11;
               }

               if (var4 != null) {
                  var4.close();
               }
            } catch (Exception var12) {
               var12.printStackTrace();
            }

            var3.append("]");
            Server.sendJsonResponse(var1, 200, var3.toString());
         }
      }
   }

   static class UsersNoPoorHandler implements HttpHandler {
      UsersNoPoorHandler() {
      }

      public void handle(HttpExchange var1) throws IOException {
         if ("OPTIONS".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendCorsResponse(var1, 204, "");
         } else if (!"GET".equalsIgnoreCase(var1.getRequestMethod())) {
            Server.sendJsonResponse(var1, 405, "{\"error\":\"Method not allowed\"}");
         } else {
            String var2 = "    SELECT DISTINCT u.username\n    FROM rental_unit u\n    WHERE EXISTS (\n        SELECT 1 FROM rental_unit r\n        WHERE r.username = u.username\n    )\n    AND NOT EXISTS (\n        SELECT 1\n        FROM rental_unit r\n        JOIN review rv ON r.id = rv.rental_id\n        WHERE r.username = u.username\n        AND rv.rating = 'poor'\n    )\n";
            StringBuilder var3 = new StringBuilder("[");

            try {
               Connection var4 = DatabaseConnection.getConnection();

               try {
                  PreparedStatement var5 = var4.prepareStatement(var2);

                  try {
                     ResultSet var6 = var5.executeQuery();

                     for(boolean var7 = true; var6.next(); var7 = false) {
                        if (!var7) {
                           var3.append(",");
                        }

                        var3.append("{\"username\":\"").append(Server.escapeJson(var6.getString("username"))).append("\"}");
                     }
                  } catch (Throwable var10) {
                     if (var5 != null) {
                        try {
                           var5.close();
                        } catch (Throwable var9) {
                           var10.addSuppressed(var9);
                        }
                     }

                     throw var10;
                  }

                  if (var5 != null) {
                     var5.close();
                  }
               } catch (Throwable var11) {
                  if (var4 != null) {
                     try {
                        var4.close();
                     } catch (Throwable var8) {
                        var11.addSuppressed(var8);
                     }
                  }

                  throw var11;
               }

               if (var4 != null) {
                  var4.close();
               }
            } catch (Exception var12) {
               var12.printStackTrace();
            }

            var3.append("]");
            Server.sendJsonResponse(var1, 200, var3.toString());
         }
      }
   }
}
