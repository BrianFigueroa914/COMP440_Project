
An Electron-based application with a simple Java backend for user authentication, built for the COMP440 course. The app provides a login/signup UI and stores credentials in a local MySQL database.

---

## 📁 Project Structure

```
COMP440_Project/
  lib/
    mysql-connector-j_9.6.0.jar        # JDBC driver
  electron/
    main.js                            # Electron entry point
    package.json
    styles.css                         # shared CSS
    src/
      assets/                          # static assets (images, etc.)
      components/                      # reusable UI pieces
      database/                        # Java database helpers
        DatabaseConnection.java
      models/                          # Java data models (User.java)
      routers/
      services/                        # Java HTTP server + auth logic
        AuthService.java
        Server.java
      ui/
        loginPage/
          index.html
          login.js
        signupPage/
          index.html
          signup.js
        dashboard/
          index.html                       
```

> _Note_: the `src/ui` folder contains the front‑end pages that Electron loads.

---

## ⚙️ Prerequisites

1. **Node.js** (v18 or later) and npm – required for the Electron frontend.
2. **Java JDK** (v11 or later) – needed to compile/run the backend server.
3. **MySQL Server** – host the `mydb` database used by the backend.
4. **MySQL Connector/J** – download the JAR and put it in the project `lib/` folder.

---

## 🔧 Setup & Installation

1. Clone the repository and navigate to the workspace root.
2. Place `mysql-connector-j_9.6.0.jar` inside `COMP440_Project/lib/`.
3. Install Electron dependencies:
   ```bash
   cd COMP440_Project/electron
   npm install
   ```
4. Create the database and table in MySQL:
   ```sql
   CREATE DATABASE mydb;
   USE mydb;
   CREATE TABLE user (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) UNIQUE,
     password VARCHAR(255)
   );
   ```

---

## ▶️ Running the Application

Start the Java backend (in one terminal): ~not working yet~
```bash
cd COMP440_Project/electron/src
javac -cp ../../lib/mysql-connector-j_9.6.0.jar \
      models/User.java \
      database/DatabaseConnection.java \
      services/AuthService.java \
      services/Server.java
java -cp .;../../lib/mysql-connector-j_9.6.0.jar services.Server
```
> On Linux/macOS use `:` instead of `;` in the classpath.

Then launch Electron (in a separate terminal):
```bash
cd COMP440_Project/electron
npm start
```
The app will open to the login page; signup and login actions communicate with the backend.

---

## 🛠 Development Notes

* **UI:** edit files under `electron/src/ui`; pages share `styles.css`.
* **Backend:** modify `services/AuthService.java` for auth logic or `Server.java` to add endpoints.
* **Database:** adjust `database/DatabaseConnection.java` connection string as needed.
* **Recompilation:** after changing Java code, re-run the `javac` command above.

---

## ℹ️ Useful Commands

| Task | Command |
|------|---------|
| Compile backend | see "Running the Application" section |
| Start backend | same as compile (runs server) |
| Launch Electron | `npm start` (from `electron/`) |

---

## 📄 License

This project is for educational purposes only.
