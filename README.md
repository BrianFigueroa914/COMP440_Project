https://youtu.be/QnBxPN2rWt0


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
3. **Maven 3.8+** – build tool for Java (simplifies compilation and running).
4. **MySQL Server 8.0+** – database for storing user credentials.
5. **MySQL Workbench 8.0** – GUI tool for database management.
6. **MySQL Connector/J** – already included in `lib/` folder.

---

## � Maven Installation Guide

### Windows

1. **Download Maven**:
   - Visit (https://maven.apache.org/download.cgi)
   - Download the binary zip archive (e.g., `apache-maven-3.9.x-bin.zip`)

2. **Extract Maven**:
   - Extract the zip to `C:\Program Files\Apache\maven` (or your preferred location)

3. **Add Maven to PATH**:
   - Right-click "This PC" or "My Computer" → **Properties**
   - Click **Advanced system settings**
   - Click **Environment Variables...**
   - Under "User variables" or "System variables", click **New** (or edit existing **PATH**)
   - Add: `C:\Program Files\Apache\maven\bin`
   - Click **OK** → **OK** → **OK**

4. **Verify Installation** (restart terminal):
   ```powershell
   mvn --version
   ```
   You should see Maven version information.

### macOS

#### Option 1: Using Homebrew (Recommended)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Maven
brew install maven

# Verify installation
mvn --version
```

#### Option 2: Manual Installation

1. **Download Maven**:
   ```bash
   cd ~/Downloads
   curl -O https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
   ```

2. **Extract Maven**:
   ```bash
   tar -xzf apache-maven-3.9.6-bin.tar.gz
   sudo mv apache-maven-3.9.6 /usr/local/maven
   ```

3. **Add Maven to PATH**:
   - Open `~/.zprofile` (or `~/.bash_profile` for older Macs):
     ```bash
     nano ~/.zprofile
     ```
   - Add this line:
     ```bash
     export PATH="/usr/local/maven/bin:$PATH"
     ```
   - Save (Ctrl+X → Y → Enter)
   - Reload:
     ```bash
     source ~/.zprofile
     ```

4. **Verify Installation**:
   ```bash
   mvn --version
   ```

---



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

You should see: `✓ All checks completed!`

### Step 3: Use environment variables for DB credentials

The Java backend now supports the following environment variables:
- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`

If these are set, the backend and test helper will use them automatically. If not, the default values are still used.

#### Use a .env file
1. Copy `.env.example` to `.env`. (cp .env.example .env)
2. Update the values for your local MySQL server.
3. Run the backend from a shell where these variables are loaded.

Your `.env` file should look like this:
```ini
DB_URL=jdbc:mysql://127.0.0.1:3306/mydb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USER=root
DB_PASSWORD=password
```

> `.env` is ignored by Git, so each developer can keep private local credentials safely.

### Step 3.1: Verify Database Connection (Optional)
Run the test connection utility:
```bash
cd COMP440_Project/electron/src
javac -cp ..\..\lib\mysql-connector-j-9.6.0.jar database/DatabaseConnection.java database/TestConnection.java
java -cp ".;..\..\lib\mysql-connector-j-9.6.0.jar" database.TestConnection
```

#### macOS/Linux
```bash
export $(grep -v '^#' .env | xargs)
javac -cp ../../lib/mysql-connector-j-9.6.0.jar database/DatabaseConnection.java database/TestConnection.java
java -cp ".:../../lib/mysql-connector-j-9.6.0.jar" database.TestConnection
```

---

> Note: `electron/src/database/DatabaseConnection.java` and `electron/src/database/TestConnection.java` are local, machine-specific files and should not be committed when they contain developer-specific connection settings. These files are ignored by `.gitignore` to prevent merge conflicts between different environments.
>
> If they were previously tracked, remove them from Git index with:
>
> ```bash
git rm --cached electron/src/database/DatabaseConnection.java electron/src/database/TestConnection.java
> git commit -m "Remove local DB helper files from version control"
> ```

### Step 4: Install Electron Dependencies

```bash
cd COMP440_Project/electron
npm install
```

---

## ▶️ Running the Application

### Terminal 1: Start the Java Backend Server (Using Maven in vs code terminal - Recommended)

Maven automatically recompiles your code every time, so you don't need to manually manage `.class` files.

```bash
cd COMP440_Project
mvn clean compile exec:java
```

You should see:
```
✓ Server started on http://localhost:8080
  POST /register - Register a new user
  POST /login - Login an existing user
```

**Subsequent runs** (after code changes):
```bash
mvn clean compile exec:java
```

### Alternative: Manual Compilation (Without Maven)

If you prefer not to use Maven:

**Windows**:
```bash
cd COMP440_Project/electron/src
javac -cp ..\..\lib\mysql-connector-j-9.6.0.jar database/DatabaseConnection.java services/InputValidator.java services/AuthService.java services/Server.java
java -cp ".;..\..\lib\mysql-connector-j-9.6.0.jar" services.Server
```

**macOS/Linux** (use `:` instead of `;`):
```bash
cd COMP440_Project/electron/src
javac -cp ../../lib/mysql-connector-j-9.6.0.jar database/DatabaseConnection.java services/InputValidator.java services/AuthService.java services/Server.java
java -cp ".:../../lib/mysql-connector-j-9.6.0.jar" services.Server
```

---

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
