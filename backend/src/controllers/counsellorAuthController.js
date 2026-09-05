const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

// =====================================================
// COUNSELLOR REGISTRATION
// =====================================================

const registerCounsellor = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      full_name,
      email,
      password,
      phone,
      specialization,
      experience_years,
      qualification,
      bio,
      consultation_fee,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !full_name ||
      !email ||
      !password ||
      !phone ||
      !specialization ||
      experience_years === undefined ||
      !qualification
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required counsellor fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long.",
      });
    }

    if (Number(experience_years) < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Experience cannot be negative.",
      });
    }

    if (
      consultation_fee !== undefined &&
      consultation_fee !== "" &&
      Number(consultation_fee) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Consultation fee cannot be negative.",
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING EMAIL
    // -------------------------------------------------

    const existingUser = await client.query(
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
        message:
          "An account with this email already exists.",
      });
    }

    // -------------------------------------------------
    // START TRANSACTION
    // -------------------------------------------------

    await client.query("BEGIN");

    const passwordHash =
      await bcrypt.hash(password, 10);

    // -------------------------------------------------
    // CREATE USER
    // -------------------------------------------------

    const userResult = await client.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES
      ($1, $2, $3, $4, 'counsellor')
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
        phone.trim(),
      ]
    );

    const user = userResult.rows[0];

    // -------------------------------------------------
    // CREATE COUNSELLOR PROFILE
    // -------------------------------------------------

    const counsellorResult =
      await client.query(
        `
        INSERT INTO counsellors
        (
          user_id,
          specialization,
          experience_years,
          qualification,
          bio,
          consultation_fee,
          is_verified
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, true)
        RETURNING
          id,
          user_id,
          specialization,
          experience_years,
          qualification,
          bio,
          consultation_fee,
          is_verified
        `,
        [
          user.id,
          specialization.trim(),
          Number(experience_years),
          qualification.trim(),
          bio ? bio.trim() : null,
          consultation_fee === "" ||
          consultation_fee === undefined
            ? 0
            : Number(consultation_fee),
        ]
      );

    const counsellor =
      counsellorResult.rows[0];

    // -------------------------------------------------
    // COMMIT TRANSACTION
    // -------------------------------------------------

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message:
        "Counsellor registered successfully.",
      data: {
        user,
        counsellor,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Counsellor registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to register counsellor.",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// COUNSELLOR LOGIN
// =====================================================

const loginCounsellor = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    // -------------------------------------------------
    // GET USER + COUNSELLOR
    //
    // IMPORTANT:
    // u.id AS user_id
    // c.id AS counsellor_id
    //
    // These are deliberately different names.
    // -------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.password_hash,
        u.phone,
        u.role,

        c.id AS counsellor_id,
        c.user_id AS counsellor_user_id,
        c.specialization,
        c.experience_years,
        c.qualification,
        c.bio,
        c.consultation_fee,
        c.is_verified

      FROM users u

      JOIN counsellors c
        ON c.user_id = u.id

      WHERE LOWER(u.email) = LOWER($1)
        AND u.role = 'counsellor'
      `,
      [email.trim()]
    );

    // -------------------------------------------------
    // USER NOT FOUND
    // -------------------------------------------------

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid counsellor email or password.",
      });
    }

    const counsellor = result.rows[0];

    // -------------------------------------------------
    // VERIFY PASSWORD
    // -------------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        counsellor.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid counsellor email or password.",
      });
    }

    // -------------------------------------------------
    // CHECK JWT SECRET
    // -------------------------------------------------

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

    // -------------------------------------------------
    // CHECK VERIFICATION
    // -------------------------------------------------

    if (!counsellor.is_verified) {
      return res.status(403).json({
        success: false,
        message:
          "Your counsellor account has not been verified.",
      });
    }

    // -------------------------------------------------
    // REMOVE PASSWORD HASH
    // -------------------------------------------------

    delete counsellor.password_hash;

    // -------------------------------------------------
    // CREATE JWT
    //
    // VERY IMPORTANT:
    //
    // JWT id = USERS.ID
    //
    // NOT counsellors.id
    //
    // This means:
    //
    // req.user.id
    //       ↓
    // users.id
    //       ↓
    // counsellors.user_id
    //
    // -------------------------------------------------

    const token = jwt.sign(
      {
        id: counsellor.user_id,
        email: counsellor.email,
        role: counsellor.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({
      success: true,
      message:
        "Counsellor login successful.",
      user: counsellor,
      token,
    });
  } catch (error) {
    console.error(
      "Counsellor login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Counsellor login failed.",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  registerCounsellor,
  loginCounsellor,
};