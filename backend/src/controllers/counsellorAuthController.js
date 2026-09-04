const bcrypt = require("bcrypt");
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

    // =====================================================
    // VALIDATION
    // =====================================================

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

    // =====================================================
    // CHECK EXISTING EMAIL
    // =====================================================

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

    // =====================================================
    // START TRANSACTION
    // =====================================================

    await client.query("BEGIN");

    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    // =====================================================
    // CREATE USER
    // =====================================================

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

    // =====================================================
    // CREATE COUNSELLOR PROFILE
    // =====================================================

    const counsellorResult = await client.query(
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

    // =====================================================
    // COMMIT
    // =====================================================

    await client.query("COMMIT");

    // =====================================================
    // RESPONSE
    // =====================================================

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

module.exports = {
  registerCounsellor,
};