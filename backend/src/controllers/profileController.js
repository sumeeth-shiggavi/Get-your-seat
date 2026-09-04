const pool = require("../config/database");

// =====================================================
// GET STUDENT PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,

        s.id AS student_id,
        s.date_of_birth,
        s.gender,
        s.city,
        s.state,
        s.preferred_course,
        s.preferred_location

      FROM users u

      LEFT JOIN students s
        ON u.id = s.user_id

      WHERE u.id = $1
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};


// =====================================================
// UPDATE STUDENT PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const {
      full_name,
      phone,
      date_of_birth,
      gender,
      city,
      state,
      preferred_course,
      preferred_location,
    } = req.body;

    // -------------------------------------------------
    // Check user
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // -------------------------------------------------
    // Update users table
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE users
      SET
        full_name = $1,
        phone = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [
        full_name || null,
        phone || null,
        user_id,
      ]
    );

    // -------------------------------------------------
    // Check student record
    // -------------------------------------------------

    const studentResult = await pool.query(
      `
      SELECT id
      FROM students
      WHERE user_id = $1
      `,
      [user_id]
    );

    // -------------------------------------------------
    // Update existing student
    // -------------------------------------------------

    if (studentResult.rows.length > 0) {
      const studentId = studentResult.rows[0].id;

      await pool.query(
        `
        UPDATE students
        SET
          date_of_birth = $1,
          gender = $2,
          city = $3,
          state = $4,
          preferred_course = $5,
          preferred_location = $6
        WHERE id = $7
        `,
        [
          date_of_birth || null,
          gender || null,
          city || null,
          state || null,
          preferred_course || null,
          preferred_location || null,
          studentId,
        ]
      );
    } else {
      // -------------------------------------------------
      // Create student record if it doesn't exist
      // -------------------------------------------------

      await pool.query(
        `
        INSERT INTO students
        (
          user_id,
          date_of_birth,
          gender,
          city,
          state,
          preferred_course,
          preferred_location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          user_id,
          date_of_birth || null,
          gender || null,
          city || null,
          state || null,
          preferred_course || null,
          preferred_location || null,
        ]
      );
    }

    // -------------------------------------------------
    // Fetch updated profile
    // -------------------------------------------------

    const updatedResult = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,

        s.id AS student_id,
        s.date_of_birth,
        s.gender,
        s.city,
        s.state,
        s.preferred_course,
        s.preferred_location

      FROM users u

      LEFT JOIN students s
        ON u.id = s.user_id

      WHERE u.id = $1
      `,
      [user_id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedResult.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};


module.exports = {
  getProfile,
  updateProfile,
};