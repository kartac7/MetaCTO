/**
 * Entry point of the Express server.
 * Sets up middleware, routes, and starts the server.
 */
const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");

const app = express();
app.use(cors());
app.use(express.json());  // Parse JSON request bodies

// Import routes
const authRoutes = require("./routes/auth");
const featureRoutes = require("./routes/features");

// Use routes with a common API prefix (e.g., '/api')
app.use("/api", authRoutes);
app.use("/api", featureRoutes);

// Basic health check route (optional)
app.get("/", (req, res) => {
  res.send("Feature Voting API is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
