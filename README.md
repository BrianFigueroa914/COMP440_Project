# COMP440_Project# COMP440_Project

A sample Electron-based application with a Java backend developed for the COMP440 course. This repository contains the source code for a login interface, dashboard, utility components, and database connectivity.

## 📁 Project Structure

```
COMP440_Project/
  lib/
    mysql-connector-j_9.6.0.jar
  electron/
    main.js
    package.json
    styles.css
    src/
      assets/
      components/
      pages/
        dashboard/
        loginPage/
          index.html
      routers/
        databaseConnection.java
      utils/
```

## 🚀 Getting Started

These instructions will help you run the project locally.

- [Java JDK](https://adoptium.net/) (v11 or later)
- MySQL server (for database connectivity)
### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (included with Node.js)


Download the MySQL Connector/J JAR file (`mysql-connector-j_9.6.0.jar`) from the [official MySQL website](https://dev.mysql.com/downloads/connector/j/) and place it in the `lib/` folder.
### Installation

```bash
cd COMP440_Project/electron
npm install
```

### Running the Application

```bash
npm start
```

This should launelectron/src/pages` and `electron/main.js` for app logic.
- Styles are located in `electron/styles.css`.
- Database connectivity is handled in `electron/src/routers/databaseConnection.java
## 🛠️ Development

- Modify UI in `src/pages` and `electron/main.js` for app logic.
- Styles are located in `electron/styles.css`.

## 📄 License

This project is for educational purposes only.
