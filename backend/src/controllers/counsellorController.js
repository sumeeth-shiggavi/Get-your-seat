const pool = require("../config/database");

// =====================================================
// GET ALL VERIFIED COUNSELLORS
// =====================================================

const getCounsellors = async (
  req,
  res
) => {
  try {
    const result =
      await pool.query(
        `
        SELECT
          c.id,
          c.user_id,
          u.full_name,
          u.email,
          u.phone,
          c.specialization,
          c.experience_years,
          c.qualification,
          c.bio,
          c.consultation_fee,
          c.is_verified
        FROM counsellors c
        JOIN users u
          ON c.user_id = u.id
        WHERE c.is_verified = true
        ORDER BY
          c.experience_years DESC,
          u.full_name ASC
        `
      );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get counsellors error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch counsellors.",
    });
  }
};

// =====================================================
// GET COUNSELLOR BY ID
// =====================================================

const getCounsellorById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const counsellorId =
        Number(id);

      if (
        !Number.isInteger(
          counsellorId
        ) ||
        counsellorId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid counsellor ID.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            c.id,
            c.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.specialization,
            c.experience_years,
            c.qualification,
            c.bio,
            c.consultation_fee,
            c.is_verified
          FROM counsellors c
          JOIN users u
            ON c.user_id = u.id
          WHERE c.id = $1
            AND c.is_verified = true
          `,
          [counsellorId]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Verified counsellor not found.",
        });
      }

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Get counsellor by ID error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch counsellor.",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCounsellors,
  getCounsellorById,
};