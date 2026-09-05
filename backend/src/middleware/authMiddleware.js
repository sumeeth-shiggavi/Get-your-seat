const jwt = require("jsonwebtoken");

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const authMiddleware = (req, res, next) => {
  try {
    // ===================================================
    // GET AUTHORIZATION HEADER
    // ===================================================

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is required.",
      });
    }

    // ===================================================
    // EXPECTED FORMAT
    // Authorization: Bearer TOKEN
    // ===================================================

    const parts =
      authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format.",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is required.",
      });
    }

    // ===================================================
    // CHECK JWT SECRET
    // ===================================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication configuration error.",
      });
    }

    // ===================================================
    // VERIFY JWT
    // ===================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ===================================================
    // STORE AUTHENTICATED USER
    // ===================================================

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error.message
    );

    // ===================================================
    // EXPIRED TOKEN
    // ===================================================

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token has expired.",
      });
    }

    // ===================================================
    // INVALID TOKEN
    // ===================================================

    return res.status(401).json({
      success: false,
      message:
        "Invalid authentication token.",
    });
  }
};

// =====================================================
// ROLE AUTHORIZATION MIDDLEWARE
// =====================================================

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Authentication middleware should
    // run before this middleware.

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // =================================================
    // CHECK USER ROLE
    // =================================================

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this resource.",
      });
    }

    next();
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = authMiddleware;

module.exports.requireRole =
  requireRole;