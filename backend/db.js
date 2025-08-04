/**
 * Database initialization and connection using SQLite3.
 * This will create the SQLite database file (if not present) and the required tables.
 */
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { DB_FILE } = require("./config");

// Open a connection to the SQLite database file
const dbPath = path.join(__dirname, DB_FILE);
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Initialize tables if they don't exist
db.serialize(() => {
  // Users table: stores registered users (with hashed passwords)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      email     TEXT UNIQUE,
      password  TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Features table: stores feature requests
  db.run(`
    CREATE TABLE IF NOT EXISTS features (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT,
      description TEXT,
      userId      INTEGER,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      /* In a real app, consider adding FOREIGN KEY (userId) REFERENCES users(id) */
    )
  `);

  // Votes table: stores upvotes (each user-feature pair should be unique)
  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      userId     INTEGER,
      featureId  INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, featureId)
      /* The UNIQUE constraint ensures one vote per user per feature :contentReference[oaicite:8]{index=8} */
      /* FOREIGN KEYs can be added for data integrity: userId -> users(id), featureId -> features(id) */
    )
  `);
});

module.exports = db;
