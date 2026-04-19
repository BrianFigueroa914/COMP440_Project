package services;

import database.DatabaseConnection;
import models.RentalUnit;

import java.sql.*;

public class RentalService {

    public boolean addRental(RentalUnit rental) {
        String checkSql =
            "SELECT COUNT(*) FROM rental_unit " +
            "WHERE username=? " +
            "AND created_at >= CURDATE() " +
            "AND created_at < CURDATE() + INTERVAL 1 DAY";

        String insertSql =
            "INSERT INTO rental_unit (username, title, description, feature, price) " +
            "VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection()) {

            // CHECK LIMIT (2 per day)
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setString(1, rental.getUsername());

                ResultSet rs = checkStmt.executeQuery();
                rs.next();

                int count = rs.getInt(1);
                if (count >= 2) {
                    return false;
                }
            }

            // INSERT RENTAL
            try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
                stmt.setString(1, rental.getUsername());
                stmt.setString(2, rental.getTitle());
                stmt.setString(3, rental.getDescription());
                stmt.setString(4, rental.getFeature());
                stmt.setInt(5, rental.getPrice());

                return stmt.executeUpdate() > 0;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}