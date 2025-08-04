/**
 * Feature and voting routes.
 * Includes:
 *   GET /features       - list all feature requests with vote counts
 *   POST /features      - create a new feature request (auth required)
 *   POST /features/:id/upvote  - upvote a feature (auth required, one vote per user)
 */
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all features (with vote counts). Auth optional (could allow public read).
router.get("/features", authenticateToken, (req, res) => {
  const userId = req.user.id;
  // Query to get all features and their vote counts
  const featureSql = `
    SELECT f.id, f.title, f.description, f.created_at,
           COUNT(v.id) AS voteCount
    FROM features f
    LEFT JOIN votes v ON f.id = v.featureId
    GROUP BY f.id
    ORDER BY f.id DESC;
  `;
  db.all(featureSql, [], (err, featureRows) => {
    if (err) return res.status(500).json({ error: "Failed to retrieve features" });
    // Query for votes by this user (to mark which features the user has upvoted)
    const voteSql = `SELECT featureId FROM votes WHERE userId = ?`;
    db.all(voteSql, [userId], (err2, voteRows) => {
      if (err2) return res.status(500).json({ error: "Failed to retrieve user votes" });
      const votedFeatures = voteRows.map(v => v.featureId);
      // Add a flag to each feature indicating if current user voted for it
      const features = featureRows.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        created_at: f.created_at,
        voteCount: f.voteCount,
        votedByUser: votedFeatures.includes(f.id)
      }));
      return res.status(200).json({ features });
    });
  });
});

// Create a new feature request (auth required)
router.post("/features", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { title, description } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Feature title is required" });
  }
  const insertSql = `INSERT INTO features(title, description, userId) VALUES(?, ?, ?)`;
  db.run(insertSql, [title, description || "", userId], function(err) {
    if (err) {
      console.error("Error inserting feature:", err.message);
      return res.status(500).json({ error: "Failed to submit feature" });
    }
    const newFeatureId = this.lastID;
    return res.status(201).json({ message: "Feature submitted successfully", featureId: newFeatureId });
  });
});

// Upvote a feature (auth required)
router.post("/features/:id/upvote", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const featureId = parseInt(req.params.id, 10);
  if (!featureId) {
    return res.status(400).json({ error: "Feature ID is required" });
  }
  // Check if feature exists (optional, to return a nicer error if needed)
  const featureCheckSql = `SELECT id FROM features WHERE id = ?`;
  db.get(featureCheckSql, [featureId], (err, feature) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!feature) {
      return res.status(404).json({ error: "Feature not found" });
    }
    // Insert vote (will fail if duplicate due to UNIQUE constraint)
    const insertVoteSql = `INSERT INTO votes(userId, featureId) VALUES(?, ?)`;
    db.run(insertVoteSql, [userId, featureId], function(err2) {
      if (err2) {
        if (err2.message.includes("UNIQUE")) {
          // User has already voted for this feature
          return res.status(400).json({ error: "User has already upvoted this feature" });
        }
        console.error("Error inserting vote:", err2.message);
        return res.status(500).json({ error: "Failed to register vote" });
      }
      return res.status(200).json({ message: "Vote registered successfully" });
    });
  });
});

module.exports = router;
