const db = require("../config/database");

const getColleges = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        name,
        short_name,
        city,
        state,
        college_type,
        website,
        description
      FROM colleges
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get colleges error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch colleges",
    });
  }
};

module.exports = {
  getColleges,
};