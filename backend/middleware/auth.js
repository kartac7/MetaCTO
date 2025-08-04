/**
 * Express middleware to verify JWT from Authorization header.
 * If valid, the decoded token (user payload) is attached to req.user; otherwise respond with 401.
 */
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Expect header format "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }
  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    // Attach the user info (from token payload) to the request object for use in routes
    req.user = userPayload;
    next();
  });
}

module.exports = { authenticateToken };
