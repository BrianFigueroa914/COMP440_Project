package database;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class TestConnection {

    public static void main(String[] args) {
        System.out.println("====================================");
        System.out.println("   MySQL Connection Test");
        System.out.println("====================================\n");

        testConnection();
    }

    private static void testConnection() {
        String url = "jdbc:mysql://127.0.0.1:3306/mydb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "fnysse";

        System.out.println("Attempting to connect to MySQL server...");
        System.out.println("URL: " + url);
        System.out.println("User: " + user);
        System.out.println("Password: " + (password.isEmpty() ? "[empty]" : "[set]"));
        System.out.println();

        try {
            // Load MySQL driver
            System.out.println("1. Loading MySQL JDBC Driver...");
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("   ✓ Driver loaded successfully\n");

            // Attempt connection
            System.out.println("2. Connecting to MySQL server...");
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("   ✓ Connection successful!\n");

            // Get metadata
            System.out.println("3. Server Information:");
            DatabaseMetaData meta = conn.getMetaData();
            System.out.println("   Database Product: " + meta.getDatabaseProductName());
            System.out.println("   Database Version: " + meta.getDatabaseProductVersion());
            System.out.println("   Driver Version: " + meta.getDriverVersion() + "\n");

            // Check if mydb database exists
            System.out.println("4. Checking 'mydb' database...");
            ResultSet catalogs = meta.getCatalogs();
            boolean mydbExists = false;
            while (catalogs.next()) {
                if ("mydb".equals(catalogs.getString(1))) {
                    mydbExists = true;
                    break;
                }
            }
            if (mydbExists) {
                System.out.println("   ✓ Database 'mydb' exists\n");
            } else {
                System.out.println("   ✗ Database 'mydb' NOT FOUND");
                System.out.println("   → Run in MySQL:\n      CREATE DATABASE mydb;\n");
            }

            // Check if user table exists
            System.out.println("5. Checking 'user' table in 'mydb'...");
            try {
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM user");
                rs.next();
                int count = rs.getInt(1);
                System.out.println("   ✓ Table 'user' exists");
                System.out.println("   → Current rows: " + count + "\n");
                rs.close();
                stmt.close();
            } catch (SQLException e) {
                System.out.println("   ✗ Table 'user' NOT FOUND");
                System.out.println("   → Run in MySQL:\n      USE mydb;\n      CREATE TABLE user (");
                System.out.println("        id INT AUTO_INCREMENT PRIMARY KEY,");
                System.out.println("        username VARCHAR(255) UNIQUE NOT NULL,");
                System.out.println("        password VARCHAR(255) NOT NULL");
                System.out.println("      );\n");
            }

            // Close connection
            conn.close();
            System.out.println("====================================");
            System.out.println("✓ All checks completed!");
            System.out.println("====================================\n");

        } catch (ClassNotFoundException e) {
            System.out.println("   ✗ ERROR: MySQL JDBC Driver not found!");
            System.out.println("   → Make sure mysql-connector-j-9.6.0.jar is in lib/ folder\n");
            e.printStackTrace();

        } catch (SQLException e) {
            System.out.println("   ✗ ERROR: Connection failed!");
            System.out.println("   → Error: " + e.getMessage() + "\n");

            // Provide helpful diagnostics
            if (e.getMessage().contains("Access denied")) {
                System.out.println("DIAGNOSIS: Invalid username or password");
                System.out.println("  - Check MySQL root password");
                System.out.println("  - Update password in DatabaseConnection.java\n");
            } else if (e.getMessage().contains("Unknown database")) {
                System.out.println("DIAGNOSIS: Database 'mydb' does not exist");
                System.out.println("  - Create database: CREATE DATABASE mydb;\n");
            } else if (e.getMessage().contains("Connection refused")) {
                System.out.println("DIAGNOSIS: Cannot connect to MySQL server");
                System.out.println("  - Is MySQL Server running?");
                System.out.println("  - Check Windows Services or start MySQL\n");
            }

            e.printStackTrace();

        } catch (Exception e) {
            System.out.println("   ✗ ERROR: Unexpected error!");
            System.out.println("   → Error: " + e.getMessage() + "\n");
            e.printStackTrace();
        }
    }
}
