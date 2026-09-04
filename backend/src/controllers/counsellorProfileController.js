const pool = require("../config/database");

// =====================================================
// GET COUNSELLOR PROFILE
// =====================================================

const getCounsellorProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,

        c.id AS counsellor_id,
        c.specialization,
        c.experience_years,
        c.qualification,
        c.bio,
        c.consultation_fee,
        c.is_verified

      FROM users u

      JOIN counsellors c
        ON c.user_id = u.id

      WHERE u.id = $1
        AND u.role = 'counsellor'
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor profile not found.",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Get counsellor profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch counsellor profile.",
    });
  }
};


// =====================================================
// UPDATE COUNSELLOR PROFILE
// =====================================================

const updateCounsellorProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.params;

    const {
      full_name,
      phone,
      specialization,
      experience_years,
      qualification,
      bio,
      consultation_fee,
    } = req.body;

    if (
      !full_name ||
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

    await client.query("BEGIN");

    // Update users table
    const userResult = await client.query(
      `
      UPDATE users

      SET
        full_name = $1,
        phone = $2,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $3
        AND role = 'counsellor'

      RETURNING
        id,
        full_name,
        email,
        phone,
        role,
        updated_at
      `,
      [
        full_name.trim(),
        phone.trim(),
        user_id,
      ]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Counsellor account not found.",
      });
    }

    // Update counsellors table
    const counsellorResult = await client.query(
      `
      UPDATE counsellors

      SET
        specialization = $1,
        experience_years = $2,
        qualification = $3,
        bio = $4,
        consultation_fee = $5

      WHERE user_id = $6

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
        specialization.trim(),
        Number(experience_years),
        qualification.trim(),
        bio ? bio.trim() : null,
        consultation_fee === "" ||
        consultation_fee === undefined
          ? 0
          : Number(consultation_fee),
        user_id,
      ]
    );

    if (counsellorResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message:
        "Counsellor profile updated successfully.",
      data: {
        user: userResult.rows[0],
        counsellor:
          counsellorResult.rows[0],
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Update counsellor profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update counsellor profile.",
    });

  } finally {
    client.release();
  }
};


module.exports = {
  getCounsellorProfile,
  updateCounsellorProfile,
};