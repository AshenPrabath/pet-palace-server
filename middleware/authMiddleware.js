// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract the token from the 'Authorization' header.
  if (!token) {
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }

  try {
    // Verify the token and attach the decoded payload to the request object.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler.
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
