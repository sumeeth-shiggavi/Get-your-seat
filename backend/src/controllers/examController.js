const pool = require("../config/database");

const getExams = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        full_name,
        description
      FROM exams
      ORDER BY id
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get exams error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
    });
  }
};

module.exports = {
  getExams,
};