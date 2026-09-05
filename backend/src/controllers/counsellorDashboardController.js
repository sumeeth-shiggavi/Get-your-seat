const pool = require("../config/database");

// =====================================================
// GET COUNSELLOR APPOINTMENTS
// =====================================================

const getCounsellorAppointments = async (req, res) => {
  try {
    // Always use the authenticated user's ID
    const user_id = req.user.id;

    // -------------------------------------------------
    // FIND COUNSELLOR LINKED TO LOGGED-IN USER
    // -------------------------------------------------

    const counsellorResult = await pool.query(
      `
      SELECT
        c.id AS counsellor_id,
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

    // -------------------------------------------------
    // GET COUNSELLOR APPOINTMENTS
    // -------------------------------------------------

    const appointmentsResult =
      await pool.query(
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
          s.user_id AS student_user_id,

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
        [counsellor.counsellor_id]
      );

    res.json({
      success: true,
      data: {
        counsellor,
        appointments:
          appointmentsResult.rows,
      },
    });
  } catch (error) {
    console.error(
      "Get counsellor appointments error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch counsellor appointments.",
    });
  }
};

// =====================================================
// MARK APPOINTMENT AS COMPLETED
// =====================================================

const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Always use authenticated user ID
    const user_id = req.user.id;

    // -------------------------------------------------
    // FIND COUNSELLOR
    // -------------------------------------------------

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
        message:
          "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    // -------------------------------------------------
    // FIND APPOINTMENT
    // -------------------------------------------------

    const appointmentResult =
      await pool.query(
        `
        SELECT
          a.id,
          a.student_id,
          a.counsellor_id,
          a.status,

          s.user_id AS student_user_id,

          u.full_name AS student_name,

          cu.full_name AS counsellor_name

        FROM appointments a

        JOIN students s
          ON a.student_id = s.id

        JOIN users u
          ON s.user_id = u.id

        JOIN counsellors c
          ON a.counsellor_id = c.id

        JOIN users cu
          ON c.user_id = cu.id

        WHERE a.id = $1
          AND a.counsellor_id = $2
        `,
        [id, counsellorId]
      );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const appointment =
      appointmentResult.rows[0];

    // -------------------------------------------------
    // CHECK STATUS
    // -------------------------------------------------

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message:
          "This appointment has already been completed.",
      });
    }

    if (
      ![
        "scheduled",
        "rescheduled",
      ].includes(appointment.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This appointment cannot be completed.",
      });
    }

    // -------------------------------------------------
    // MARK AS COMPLETED
    // -------------------------------------------------

    const result = await pool.query(
      `
      UPDATE appointments
      SET status = 'completed'
      WHERE id = $1
        AND counsellor_id = $2
        AND status IN (
          'scheduled',
          'rescheduled'
        )
      RETURNING *
      `,
      [id, counsellorId]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "Appointment could not be completed. It may have already been updated.",
      });
    }

    // -------------------------------------------------
    // NOTIFY STUDENT
    // -------------------------------------------------

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
        appointment.student_user_id,
        "Appointment Completed",
        `Your counselling appointment with ${appointment.counsellor_name} has been completed successfully.`,
      ]
    );

    res.json({
      success: true,
      message:
        "Appointment marked as completed and student notified.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Complete appointment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to complete appointment.",
    });
  }
};

// =====================================================
// ADD / UPDATE CONSULTATION NOTES
// =====================================================

const updateAppointmentNotes = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { notes } = req.body;

    // Always use authenticated user ID
    const user_id = req.user.id;

    // -------------------------------------------------
    // FIND COUNSELLOR
    // -------------------------------------------------

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
        message:
          "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    // -------------------------------------------------
    // UPDATE NOTES
    // Only the counsellor who owns the appointment
    // can update its notes.
    // -------------------------------------------------

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
        message:
          "Appointment not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Consultation notes updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update appointment notes error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update consultation notes.",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCounsellorAppointments,
  completeAppointment,
  updateAppointmentNotes,
};