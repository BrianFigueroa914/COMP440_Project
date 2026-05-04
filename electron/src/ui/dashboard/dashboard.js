const BASE = "http://localhost:8080";

const username = localStorage.getItem("username");
const id_width = 7;
const title_width = 30;
const price_width = 5;
const owner_width = 50;
let searchResults = [];

    // formatting output
    function col(text , width) {
      return String(text).padEnd(width);
    }

    function renderList(data, username) {
      const results = document.getElementById("results");
      results.innerHTML = "";

      data.forEach(item => {
        const li = document.createElement("li");
        const indicator = item.username == username ? " (Your Rental)" : "";

        li.innerText = [
          col(`ID: ${item.id}`, id_width),
          col(item.title, title_width),
          col(`$${item.price}`, price_width),
          col(`Owner: ${item.username}${indicator}`, owner_width)
        ].join(" | ");

        results.appendChild(li);
      });
    }

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

    searchResults = data;   // save results globally
    renderList(searchResults, username);


  } catch (err) {
    console.error("Search error:", err);
    await AppModal.show(`Search failed: ${err.message}`, "Error");
  }
});
document.getElementById("searchTwoBtn").addEventListener("click", async () => {
  const x = document.getElementById("featureX").value.trim();
  const y = document.getElementById("featureY").value.trim();

  if (!x || !y) {
    await AppModal.show("Please enter both features.", "Missing Input");
    return;
  }

  try {
    const res = await fetch(`${BASE}/searchTwoFeatures?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);

    if (!res.ok) {
      await AppModal.show("Server error while searching.", "Error");
      return;
    }

    const data = await res.json();
    const list = document.getElementById("twoFeatureResults");
    list.innerHTML = "";

    if (data.length === 0) {
      list.innerHTML = "<li>No users found.</li>";
      return;
    }

    data.forEach(user => {
      const li = document.createElement("li");
      li.innerText = `User: ${user.username}`;
      list.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    await AppModal.show("Search failed: " + err.message, "Error");
  }
});

document.getElementById("priceFilter").addEventListener("change", async (e) => {
  const value = e.target.value;
  if (value === "asc") {
    searchResults.sort((a, b) => a.price - b.price);
  } else if (value === "desc") {
    searchResults.sort((a, b) => b.price - a.price);
  }else {
    searchResults.sort((a, b) => a.id - b.id); // default order by ID  
  }

  renderList(searchResults,username);
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