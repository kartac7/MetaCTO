/**
 * Auth routes: registration and login.
 * Allows new users to register and existing users to login, returning a JWT on success.
 */
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

const router = express.Router();

// User Registration
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  // Check if the email is already taken
  const normalizedEmail = email.toLowerCase();
  const findSql = `SELECT id FROM users WHERE email = ?`;
  db.get(findSql, [normalizedEmail], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (row) {
      // Email already exists
      return res.status(409).json({ error: "Email is already registered" });
    }
    // Email is free, create new user
    const hashedPass = bcrypt.hashSync(password, 10);  // Hash the password (with saltRounds=10)
    const insertSql = `INSERT INTO users(email, password) VALUES(?, ?)`;
    db.run(insertSql, [normalizedEmail, hashedPass], function(err) {
      if (err) {
        console.error("Error inserting user:", err.message);
        return res.status(500).json({ error: "Failed to register user" });
      }
      const userId = this.lastID;  // newly inserted user's id
      // Generate JWT token for the new user
      const token = jwt.sign({ id: userId, email: normalizedEmail }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.status(200).json({ token });
    });
  });
});

// User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const normalizedEmail = email.toLowerCase();
  const findSql = `SELECT id, password FROM users WHERE email = ?`;
  db.get(findSql, [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }
    // Check password with bcrypt
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    // Password is correct – generate a JWT for the user
    const token = jwt.sign({ id: user.id, email: normalizedEmail }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(200).json({ token });
  });
});

module.exports = router;
