const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

// =====================================================
// HELPERS
// =====================================================

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.sign(
    {
      id: user.id,
      user_id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    user_id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  };
};

// =====================================================
// REGISTER STUDENT
// =====================================================

const register = async (
  req,
  res
) => {
  const client =
    await pool.connect();

  try {
    const {
      full_name,
      email,
      password,
      phone,
      role,
    } = req.body;

    const cleanName =
      String(full_name || "").trim();

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const cleanPhone =
      phone
        ? String(phone).trim()
        : null;

    // Student registration should
    // always create a student account.
    const requestedRole =
      role || "student";

    if (
      requestedRole !==
      "student"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Public registration is available only for students.",
      });
    }

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message:
          "Full name is required.",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Full name must contain at least 2 characters.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required.",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required.",
      });
    }

    if (
      String(password).length <
      6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const existingUser =
      await client.query(
        `
        SELECT
          id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanEmail]
      );

    if (
      existingUser.rows.length >
      0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const passwordHash =
      await bcrypt.hash(
        String(password),
        12
      );

    // =================================================
    // CREATE USER + STUDENT PROFILE
    // =================================================

    await client.query(
      "BEGIN"
    );

    const userResult =
      await client.query(
        `
        INSERT INTO users (
          full_name,
          email,
          password_hash,
          phone,
          role
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'student'
        )
        RETURNING
          id,
          full_name,
          email,
          phone,
          role,
          created_at
        `,
        [
          cleanName,
          cleanEmail,
          passwordHash,
          cleanPhone,
        ]
      );

    const user =
      userResult.rows[0];

    await client.query(
      `
      INSERT INTO students (
        user_id
      )
      VALUES ($1)
      `,
      [user.id]
    );

    await client.query(
      "COMMIT"
    );

    const token =
      createToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Student account created successfully.",
      token,
      user:
        sanitizeUser(user),
    });
  } catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "Student registration error:",
      error
    );

    if (
      error.code ===
      "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create account.",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required.",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const result =
      await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          password_hash,
          phone,
          role,
          created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanEmail]
      );

    if (
      result.rows.length ===
      0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const user =
      result.rows[0];

    // =================================================
    // VERIFY PASSWORD
    // =================================================

    const passwordMatch =
      await bcrypt.compare(
        String(password),
        user.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // =================================================
    // CREATE TOKEN
    // =================================================

    const token =
      createToken(user);

    return res.json({
      success: true,
      message:
        "Login successful.",
      token,
      user:
        sanitizeUser(user),
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login. Please try again.",
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

const getCurrentUser =
  async (req, res) => {
    try {
      const userId =
        Number(
          req.user?.user_id ||
            req.user?.id
        );

      if (
        !Number.isInteger(
          userId
        ) ||
        userId <= 0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            full_name,
            email,
            phone,
            role,
            created_at
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [userId]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      return res.json({
        success: true,
        user:
          sanitizeUser(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch account details.",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  register,
  login,
  getCurrentUser,
};