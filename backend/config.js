/**
 * Configuration constants for the backend.
 * In a real project, sensitive values like JWT secret should be in environment variables.
 */
module.exports = {
  JWT_SECRET: "change_this_secret",       // Secret key for signing JWTs (use an env var in production)
  JWT_EXPIRES_IN: "24h",                  // Token expiration (e.g., 24h)
  DB_FILE: "database.sqlite",             // SQLite database file name
  PORT: 3000                              // Port for the Express server
};
