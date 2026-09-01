const pool = require("../config/database");

const predictColleges = async (req, res) => {
  try {
    const {
      exam,
      rank,
      category,
      state,
    } = req.body;

    // Validate input
    if (!exam || !rank || !category || !state) {
      return res.status(400).json({
        success: false,
        message: "Exam, rank, category and state are required",
      });
    }

    const studentRank = Number(rank);

    if (!Number.isInteger(studentRank) || studentRank <= 0) {
      return res.status(400).json({
        success: false,
        message: "Rank must be a positive number",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id AS college_id,
        c.name AS college_name,
        c.short_name,
        c.city,
        c.state,
        c.college_type,
        c.website,

        co.name AS course_name,
        co.degree,

        b.name AS branch_name,
        b.code AS branch_code,

        cc.total_seats,

        e.name AS exam_name,

        cf.year,
        cf.category,
        cf.quota,
        cf.opening_rank,
        cf.closing_rank

      FROM cutoffs cf

      JOIN exams e
        ON cf.exam_id = e.id

      JOIN college_courses cc
        ON cf.college_course_id = cc.id

      JOIN colleges c
        ON cc.college_id = c.id

      JOIN courses co
        ON cc.course_id = co.id

      LEFT JOIN branches b
        ON cc.branch_id = b.id

      WHERE LOWER(e.name) = LOWER($1)
        AND LOWER(cf.category) = LOWER($2)
        AND LOWER(c.state) = LOWER($4)
        AND cf.opening_rank <= $3
        AND cf.closing_rank >= $3

      ORDER BY
        cf.closing_rank ASC,
        c.name ASC;
      `,
      [
        exam,
        category,
        studentRank,
        state,
      ]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("Prediction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to predict colleges",
    });
  }
};

module.exports = {
  predictColleges,
};