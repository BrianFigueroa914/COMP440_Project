package services;

import database.DatabaseConnection;
import models.Review;

import java.sql.*;

public class ReviewService {

    public boolean addReview(Review review) {

        String countSql =
            "SELECT COUNT(*) FROM review " +
            "WHERE username=? " +
            "AND created_at >= CURDATE() " +
            "AND created_at < CURDATE() + INTERVAL 1 DAY";

        String ownerSql =
            "SELECT username FROM rental_unit WHERE id=?";

        String insertSql =
            "INSERT INTO review (rental_id, username, rating, comment) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection()) {

            // LIMIT 3 REVIEWS PER DAY
            try (PreparedStatement countStmt = conn.prepareStatement(countSql)) {
                countStmt.setString(1, review.getUsername());

                ResultSet rs = countStmt.executeQuery();
                rs.next();

                if (rs.getInt(1) >= 3) {
                    return false;
                }
            }

            // PREVENT SELF REVIEW
            try (PreparedStatement ownerStmt = conn.prepareStatement(ownerSql)) {
                ownerStmt.setInt(1, review.getRentalId());

                ResultSet rs = ownerStmt.executeQuery();

                if (rs.next()) {
                    String owner = rs.getString("username");
                    if (owner.equals(review.getUsername())) {
                        return false;
                    }
                }
            }

            // INSERT REVIEW
            try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
                stmt.setInt(1, review.getRentalId());
                stmt.setString(2, review.getUsername());
                stmt.setString(3, review.getRating());
                stmt.setString(4, review.getComment());

                return stmt.executeUpdate() > 0;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}