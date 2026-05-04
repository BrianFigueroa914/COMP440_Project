const BASE = "http://localhost:8080";

const username = localStorage.getItem("username");

if (!username) {
  AppModal.show("You are not logged in.", "Not Logged In").then(() => {
    window.location.href = "../loginPage/index.html";
  });
}

document.getElementById("welcomeText").innerText =
  "Welcome, " + username + "!";

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "../loginPage/index.html";
});

document.getElementById("addRentalBtn").addEventListener("click", async () => {
  const body = {
    username: username,
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    feature: document.getElementById("feature").value,
    price: document.getElementById("price").value
  };

  try {
    const res = await fetch(BASE + "/addRental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.success) {
      await AppModal.show("Rental added successfully!", "Success");
      document.getElementById("title").value = "";
      document.getElementById("description").value = "";
      document.getElementById("feature").value = "";
      document.getElementById("price").value = "";
    } else {
      await AppModal.show(data.error || "Failed to add rental.", "Error");
    }
  } catch (err) {
    await AppModal.show("Server error. Please try again.", "Error");
  }
});

document.getElementById("searchBtn").addEventListener("click", async () => {
  const feature = document.getElementById("searchFeature").value;

  if (!feature.trim()) {
    await AppModal.show("Please enter a feature to search.", "Empty Search");
    return;
  }

  try {
    const res = await fetch(BASE + "/search?feature=" + encodeURIComponent(feature));
    
    if (!res.ok) {
      console.error("Server error:", res.status, res.statusText);
      await AppModal.show(`Server error: ${res.status} ${res.statusText}`, "Error");
      return;
    }

    const data = await res.json();
    console.log("Search results:", data);

    const results = document.getElementById("results");
    results.innerHTML = "";

    if (!Array.isArray(data)) {
      console.error("Response is not an array:", data);
      await AppModal.show("Invalid response from server.", "Error");
      return;
    }

    if (data.length === 0) {
      results.innerHTML = "<li>No results found.</li>";
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      const indicator = item.username == username ? " (Your Rental)" : "";
      li.innerText = `ID: ${item.id} | ${item.title} | $${item.price} | ${item.description} | Owner: ${item.username}${indicator}`;
      results.appendChild(li);
    });

  } catch (err) {
    console.error("Search error:", err);
    await AppModal.show(`Search failed: ${err.message}`, "Error");
  }
});

document.getElementById("reviewBtn").addEventListener("click", async () => {
  const body = {
    username: username,
    rental_id: document.getElementById("rentalId").value,
    rating: document.getElementById("rating").value,
    comment: document.getElementById("comment").value
  };

  try {
    const res = await fetch(BASE + "/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.success) {
      await AppModal.show("Review submitted successfully!", "Success");
      document.getElementById("rentalId").value = "";
      document.getElementById("comment").value = "";
    } else {
      await AppModal.show(data.error || "Failed to submit review.", "Error");
    }
  } catch (err) {
    await AppModal.show("Server error. Please try again.", "Error");
  }
});