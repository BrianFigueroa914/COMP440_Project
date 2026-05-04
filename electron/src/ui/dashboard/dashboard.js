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

document.getElementById("highRatedBtn").addEventListener("click", async () => {
  const hrUsername = document.getElementById("hrUsername").value;
 
  try {
    const res = await fetch(BASE + "/highRatedRentals?username=" + encodeURIComponent(hrUsername));
    const data = await res.json();
 
    const results = document.getElementById("hrResults");
    results.innerHTML = "";
 
    if (data.length === 0) {
      const li = document.createElement("li");
      li.innerText = "No rentals found with only Excellent or Good reviews.";
      results.appendChild(li);
      return;
    }
 
    data.forEach(item => {
      const li = document.createElement("li");
      li.innerText = `ID: ${item.id} | ${item.title} | ${item.feature} | $${item.price}/night`;
      results.appendChild(li);
    });
  } catch (err) {
    alert("Search failed");
  }
});
 

document.getElementById("topPostersBtn").addEventListener("click", async () => {
  const date = document.getElementById("posterDate").value;
 
  try {
    const res = await fetch(BASE + "/topPosters?date=" + encodeURIComponent(date));
    const data = await res.json();
 
    const results = document.getElementById("tpResults");
    results.innerHTML = "";
 
    if (data.length === 0) {
      const li = document.createElement("li");
      li.innerText = "No rentals posted on that date.";
      results.appendChild(li);
      return;
    }
 
    data.forEach(item => {
      const li = document.createElement("li");
      li.innerText = `${item.username} — ${item.total} rental(s) posted`;
      results.appendChild(li);
    });
  } catch (err) {
    alert("Search failed");
  }
});