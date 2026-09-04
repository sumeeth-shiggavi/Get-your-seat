const pool = require("../config/database");

const getCounsellors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
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
      ORDER BY c.experience_years DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get counsellors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch counsellors",
    });
  }
};

module.exports = {
  getCounsellors,
};