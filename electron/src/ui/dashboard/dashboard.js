const BASE = "http://localhost:8080";

const username = localStorage.getItem("username");

if (!username) {
  AppModal.show("You are not logged in.", "Not Logged In").then(() => {
    window.location.href = "../loginPage/index.html";
  });
}

document.getElementById("welcomeText").innerText =
  "Logged in as: " + username;

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

  try {
    const res = await fetch(BASE + "/search?feature=" + encodeURIComponent(feature));
    const data = await res.json();

    const results = document.getElementById("results");
    results.innerHTML = "";

    data.forEach(item => {
      const li = document.createElement("li");
      const indicator = item.username == username ? " (Your Rental)" : "";
      li.innerText = `ID: ${item.id} | ${item.title}${indicator}`;
      results.appendChild(li);
    });

  } catch (err) {
    await AppModal.show("Search failed. Please try again.", "Error");
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