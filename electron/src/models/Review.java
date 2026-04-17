package models;

public class Review {
    private int rentalId;
    private String username;
    private String rating;
    private String comment;

    public Review() {}

    public Review(int rentalId, String username, String rating, String comment) {
        this.rentalId = rentalId;
        this.username = username;
        this.rating = rating;
        this.comment = comment;
    }

    public int getRentalId() { return rentalId; }
    public String getUsername() { return username; }
    public String getRating() { return rating; }
    public String getComment() { return comment; }
}