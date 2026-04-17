package models;

public class RentalUnit {
    private int id;
    private String username;
    private String title;
    private String description;
    private String feature;
    private int price;

    public RentalUnit() {}

    public RentalUnit(String username, String title, String description, String feature, int price) {
        this.username = username;
        this.title = title;
        this.description = description;
        this.feature = feature;
        this.price = price;
    }

    public String getUsername() { return username; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFeature() { return feature; }
    public int getPrice() { return price; }
}