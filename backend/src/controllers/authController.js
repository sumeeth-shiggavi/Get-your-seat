const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/database");

// REGISTER
const register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const existingUser = await db.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES ($1, $2, $3, $4, $5)

      RETURNING
        id,
        full_name,
        email,
        phone,
        role,
        created_at
      `,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        phone || null,
        "student",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        phone,
        role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    delete user.password_hash;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  register,
  login,
};