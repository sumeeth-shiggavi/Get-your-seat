const pool = require("../config/database");

// =====================================================
// GET COUNSELLOR APPOINTMENTS
// =====================================================

const getCounsellorAppointments = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find counsellor linked to logged-in user
    const counsellorResult = await pool.query(
      `
      SELECT
        c.id,
        u.full_name,
        u.email,
        u.phone,
        c.specialization,
        c.experience_years,
        c.qualification,
        c.consultation_fee
      FROM counsellors c
      JOIN users u
        ON c.user_id = u.id
      WHERE c.user_id = $1
      `,
      [user_id]
    );

    if (counsellorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor profile not found.",
      });
    }

    const counsellor =
      counsellorResult.rows[0];

    // Get appointments
    const appointmentsResult = await pool.query(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.status,
        a.meeting_link,
        a.notes,
        a.created_at,

        s.id AS student_id,
        u.full_name AS student_name,
        u.email AS student_email,
        u.phone AS student_phone,

        s.date_of_birth,
        s.gender,
        s.city,
        s.state,
        s.preferred_course,
        s.preferred_location

      FROM appointments a

      JOIN students s
        ON a.student_id = s.id

      JOIN users u
        ON s.user_id = u.id

      WHERE a.counsellor_id = $1

      ORDER BY
        a.appointment_date ASC,
        a.start_time ASC
      `,
      [counsellor.id]
    );

    res.json({
      success: true,
      data: {
        counsellor,
        appointments: appointmentsResult.rows,
      },
    });
  } catch (error) {
    console.error(
      "Get counsellor appointments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch counsellor appointments.",
    });
  }
};


// =====================================================
// MARK APPOINTMENT AS COMPLETED
// =====================================================

const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find counsellor
    const counsellorResult = await pool.query(
      `
      SELECT id
      FROM counsellors
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (counsellorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    // Complete appointment
    const result = await pool.query(
      `
      UPDATE appointments
      SET status = 'completed'
      WHERE id = $1
        AND counsellor_id = $2
        AND status IN ('scheduled', 'rescheduled')
      RETURNING *
      `,
      [id, counsellorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or cannot be completed.",
      });
    }

    // Get student user ID
    const studentResult = await pool.query(
      `
      SELECT
        s.user_id,
        u.full_name AS student_name
      FROM appointments a
      JOIN students s
        ON a.student_id = s.id
      JOIN users u
        ON s.user_id = u.id
      WHERE a.id = $1
      `,
      [id]
    );

    if (studentResult.rows.length > 0) {
      const student =
        studentResult.rows[0];

      // Create notification
      await pool.query(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          is_read
        )
        VALUES
        ($1, $2, $3, false)
        `,
        [
          student.user_id,
          "Appointment Completed",
          "Your counselling appointment has been completed successfully.",
        ]
      );
    }

    res.json({
      success: true,
      message: "Appointment marked as completed.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Complete appointment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to complete appointment.",
    });
  }
};


// =====================================================
// ADD / UPDATE CONSULTATION NOTES
// =====================================================

const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, notes } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find counsellor
    const counsellorResult = await pool.query(
      `
      SELECT id
      FROM counsellors
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (counsellorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    const result = await pool.query(
      `
      UPDATE appointments
      SET notes = $1
      WHERE id = $2
        AND counsellor_id = $3
      RETURNING *
      `,
      [
        notes || null,
        id,
        counsellorId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.json({
      success: true,
      message: "Consultation notes updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update appointment notes error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update consultation notes.",
    });
  }
};


module.exports = {
  getCounsellorAppointments,
  completeAppointment,
  updateAppointmentNotes,
};