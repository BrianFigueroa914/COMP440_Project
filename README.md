
An Electron-based application with a Java backend for user authentication, built for the COMP440 course. The app provides a login/signup UI and stores credentials in a local MySQL database with SQL injection protection and input validation.

---

## 📁 Project Structure

```
COMP440_Project/
  lib/
    mysql-connector-j-9.6.0.jar        # JDBC driver
  electron/
    main.js                            # Electron entry point
    package.json
    styles.css                         # shared CSS
    src/
      assets/                          # static assets (images, etc.)
      components/                      # reusable UI pieces
      database/                        # Java database helpers
        DatabaseConnection.java
        TestConnection.java
        mydb_user.sql                  # Database schema
      models/                          # Java data models
        User.java
      routers/
      services/                        # Java HTTP server + auth logic
        AuthService.java
        Server.java
        InputValidator.java            # Centralized input validation
      ui/
        loginPage/
          index.html
          login.js
        signupPage/
          index.html
          signup.js
        utils/
          validation.js                # Frontend validation utility
        dashboard/
          index.html
```

> _Note_: the `src/ui` folder contains the front‑end pages that Electron loads.

---

## ⚙️ Prerequisites

1. **Node.js** (v18 or later) and npm – required for the Electron frontend.
2. **Java JDK** (v11 or later) – needed to compile/run the backend server.
3. **MySQL Server 8.0+** – database for storing user credentials.
4. **MySQL Workbench 8.0** – GUI tool for database management.
5. **MySQL Connector/J** – already included in `lib/` folder.

---

## 🔧 Setup & Installation

### Step 1: Verify MySQL Server is Running

**Windows**: 
- Open Services (search "Services" in Start menu)
- Look for "MySQL80" (or similar)
- Ensure it's running. If not, right-click → Start

**macOS/Linux**:
```bash
mysql --version
mysql -u root -p
```

### Step 2: Import Database Schema Using MySQL Workbench

1. **Open MySQL Workbench 8.0**
2. **Click your database connection** (should be configured for localhost:3306)
3. **Enter password**: You might be asked to create one on the spot
4. **Go to File → Open SQL Script**
   - Navigate to: `COMP440_Project/electron/src/database/mydb_user.sql`
   - Click Open
5. **Execute the script**: 
   - Press `⚡ lightning bolt` icon (or Ctrl+Shift+Enter)
   - You should see: "Successfully executed"
6. **Verify the database and table were created**:
   - In the left panel, right-click and select "Refresh All"
   - You should see `mydb` database with a `user` table

**Alternative: Import via File Menu**
1. From the home page, click **Data Import**
2. Select **Import from Self-Contained File**
3. Choose the SQL file: `electron/src/database/mydb_user.sql`
4. Click Start Import

### Step 3: Verify Database Connection (Optional)

Run the test connection utility:
```bash
cd COMP440_Project/electron/src
javac -cp ..\..\lib\mysql-connector-j-9.6.0.jar database/DatabaseConnection.java database/TestConnection.java
java -cp ".;..\..\lib\mysql-connector-j-9.6.0.jar" database.TestConnection
```

You should see: `✓ All checks completed!`

### Step 4: Install Electron Dependencies

```bash
cd COMP440_Project/electron
npm install
```

---

## ▶️ Running the Application

### Terminal 1: Start the Java Backend Server(vs code terminal recommended)

```bash
cd COMP440_Project/electron/src
javac -cp ..\..\lib\mysql-connector-j-9.6.0.jar database/DatabaseConnection.java services/InputValidator.java services/AuthService.java services/Server.java
java -cp ".;..\..\lib\mysql-connector-j-9.6.0.jar" services.Server
```

> On **macOS/Linux**, use `:` instead of `;` in the classpath:
> ```bash
> java -cp ".:../../lib/mysql-connector-j-9.6.0.jar" services.Server
> ```

You should see:
```
✓ Server started on http://localhost:8080
  POST /register - Register a new user
  POST /login - Login an existing user
```

### Terminal 2: Start the Electron Frontend (gitbash recommended)

```bash
cd COMP440_Project/electron
npm start
```

The Electron app will launch with the login page.

---

## 🔐 Security Features

✅ **SQL Injection Protection**
- Prepared statements (backend)
- Input validation on frontend and backend
- SQL keyword detection (UNION, SELECT, DROP, etc.)
- Character whitelist (alphanumeric + underscore + hyphen)

✅ **Password Security**
- SHA-256 hashing
- 6-128 character requirement
- Secure storage in database

✅ **Input Validation**
- Centralized validation in `InputValidator.java` and `validation.js`
- Prevents XSS and injection attacks
- Username: 3-50 characters, safe characters only
- Password: 6-128 characters

---

## 🛠 Development Notes

### Database Schema

The `user` table includes:
- `username` (VARCHAR 50) - Primary key, unique
- `password` (VARCHAR 255) - SHA-256 hashed
- `firstName` (VARCHAR 50) - Optional
- `lastName` (VARCHAR 50) - Optional
- `email` (VARCHAR 100) - Unique, optional
- `phone` (VARCHAR 20) - Unique, optional

### Backend Structure

- **`Server.java`** - HTTP server listening on port 8080
- **`AuthService.java`** - User registration and authentication
- **`InputValidator.java`** - Centralized input validation (reusable across services)
- **`DatabaseConnection.java`** - Connection pooling to MySQL

### Frontend Structure

- **`validation.js`** - Shared validation utility (prevents code duplication)
- **`signup.js`** - Registration form handler
- **`login.js`** - Login form handler
- **`styles.css`** - Shared styles across pages

### Making Changes

**Updating Validation Rules**:
- Backend: Edit `services/InputValidator.java`
- Frontend: Edit `ui/utils/validation.js`
- Changes apply everywhere automatically

**Adding New API Endpoints**:
1. Add handler in `services/Server.java`
2. Register with `server.createContext("/your-endpoint", new YourHandler())`

**Modifying Database Schema**:
1. Update `electron/src/database/mydb_user.sql`
2. Execute the SQL script in MySQL Workbench
3. Update corresponding Java models accordingly

---

## 🆘 Troubleshooting

### Issue: "Access denied for user 'root'@'localhost'"
- **Solution**: Verify MySQL password
- Check DatabaseConnection.java has correct credentials

### Issue: "Database 'mydb' not found"
- **Solution**: Import the SQL file from MySQL Workbench (see Step 2 above)
- Verify the script executed successfully

### Issue: "Public Key Retrieval is not allowed"
- **Solution**: This is already fixed in DatabaseConnection.java
- Connection string includes `allowPublicKeyRetrieval=true`

### Issue: "Cannot connect to MySQL Server"
- **Solution**: Verify MySQL Server is running (see Prerequisites)
- Windows: Check Services to ensure MySQL80 is running
- Try restarting MySQL service if needed

### Issue: Frontend cannot reach backend
- Make sure Java server is running on Terminal 1
- Verify no firewall is blocking port 8080
- Check browser console for network errors

---

## 📊 Database Credentials

```
Host: 127.0.0.1
Port: 3306
Username: root
Password: 
Database: mydb
```

---

## 📝 License

COMP440 Course Project - ISC

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
