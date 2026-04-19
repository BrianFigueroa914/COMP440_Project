const BASE = "http://localhost:8080";

const username = localStorage.getItem("username");

if (!username) {
  alert("You are not logged in.");
  window.location.href = "../loginPage/index.html";
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
    alert(data.success ? "Rental added!" : (data.error || "Failed"));
  } catch (err) {
    alert("Server error");
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
      li.innerText = `ID: ${item.id} | ${item.title}`;
      results.appendChild(li);
    });

  } catch (err) {
    alert("Search failed");
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
    alert(data.success ? "Review submitted!" : (data.error || "Failed"));
  } catch (err) {
    alert("Server error");
  }
});