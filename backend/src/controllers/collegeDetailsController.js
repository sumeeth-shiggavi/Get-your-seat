const pool = require("../config/database");

const getCollegeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get college information
    const collegeResult = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.short_name,
        c.city,
        c.state,
        c.college_type,
        c.website,
        c.description
      FROM colleges c
      WHERE c.id = $1
      `,
      [id]
    );

    if (collegeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const college = collegeResult.rows[0];

    // Get courses and branches
    const coursesResult = await pool.query(
      `
      SELECT
        cc.id AS college_course_id,
        cc.total_seats,

        co.id AS course_id,
        co.name AS course_name,
        co.description AS course_description,

        b.id AS branch_id,
        b.name AS branch_name,
        b.code AS branch_code

      FROM college_courses cc

      LEFT JOIN courses co
        ON cc.course_id = co.id

      LEFT JOIN branches b
        ON cc.branch_id = b.id

      WHERE cc.college_id = $1

      ORDER BY co.name, b.name
      `,
      [id]
    );

    const courses = coursesResult.rows;

    // Get cutoff information
    const cutoffsResult = await pool.query(
      `
      SELECT
        cf.id,
        cf.college_course_id,
        cf.exam_id,
        cf.year,
        cf.category,
        cf.quota,
        cf.opening_rank,
        cf.closing_rank
      FROM cutoffs cf
      WHERE cf.college_course_id IN (
        SELECT id
        FROM college_courses
        WHERE college_id = $1
      )
      ORDER BY cf.year DESC, cf.closing_rank ASC
      `,
      [id]
    );

    const cutoffs = cutoffsResult.rows;

    res.json({
      success: true,
      data: {
        college,
        courses,
        cutoffs,
      },
    });

  } catch (error) {
    console.error("Get college details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch college details",
    });
  }
};

module.exports = {
  getCollegeDetails,
};