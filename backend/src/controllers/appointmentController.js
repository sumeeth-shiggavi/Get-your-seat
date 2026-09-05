const pool = require("../config/database");

// =====================================================
// CREATE APPOINTMENT
// =====================================================

const createAppointment = async (req, res) => {
  try {
    const {
      counsellor_id,
      appointment_date,
      start_time,
      end_time,
      notes,
    } = req.body;

    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    if (
      !counsellor_id ||
      !appointment_date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All appointment fields are required.",
      });
    }

    // =================================================
    // FIND STUDENT LINKED TO LOGGED-IN USER
    // =================================================

    const studentResult = await pool.query(
      `
      SELECT id
      FROM students
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Student profile not found.",
      });
    }

    const studentDbId =
      studentResult.rows[0].id;

    // =================================================
    // CHECK COUNSELLOR
    // =================================================

    const counsellorResult =
      await pool.query(
        `
        SELECT
          c.id,
          u.full_name,
          c.specialization,
          c.consultation_fee
        FROM counsellors c
        JOIN users u
          ON c.user_id = u.id
        WHERE c.id = $1
          AND c.is_verified = true
        `,
        [counsellor_id]
      );

    if (
      counsellorResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor not found.",
      });
    }

    const counsellor =
      counsellorResult.rows[0];

    // =================================================
    // CHECK TIME VALIDITY
    // =================================================

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time.",
      });
    }

    // =================================================
    // CHECK OVERLAPPING APPOINTMENTS
    // =================================================

    const overlapResult =
      await pool.query(
        `
        SELECT id
        FROM appointments
        WHERE counsellor_id = $1
          AND appointment_date = $2
          AND status NOT IN ('cancelled')
          AND start_time < $4
          AND end_time > $3
        `,
        [
          counsellor_id,
          appointment_date,
          start_time,
          end_time,
        ]
      );

    if (
      overlapResult.rows.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This counsellor already has an appointment during the selected time.",
      });
    }

    // =================================================
    // CREATE APPOINTMENT
    // =================================================

    const result = await pool.query(
      `
      INSERT INTO appointments
      (
        student_id,
        counsellor_id,
        appointment_date,
        start_time,
        end_time,
        status,
        notes
      )
      VALUES
      ($1, $2, $3, $4, $5, 'scheduled', $6)
      RETURNING *
      `,
      [
        studentDbId,
        counsellor_id,
        appointment_date,
        start_time,
        end_time,
        notes || null,
      ]
    );

    const appointment =
      result.rows[0];

    // =================================================
    // CREATE BOOKING NOTIFICATION
    // =================================================

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
        user_id,
        "Appointment Booked",
        `Your counselling appointment with ${counsellor.full_name} has been successfully booked.`,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Appointment booked successfully.",
      data: appointment,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create appointment.",
    });
  }
};


// =====================================================
// GET STUDENT APPOINTMENTS
// =====================================================

const getStudentAppointments =
  async (req, res) => {
    try {
      // Use authenticated user ID from JWT
      const user_id = req.user.id;

      // =================================================
      // FIND STUDENT
      // =================================================

      const studentResult =
        await pool.query(
          `
          SELECT id
          FROM students
          WHERE user_id = $1
          `,
          [user_id]
        );

      if (
        studentResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      const studentId =
        studentResult.rows[0].id;

      // =================================================
      // GET APPOINTMENTS
      // =================================================

      const result = await pool.query(
        `
        SELECT
          a.id,
          a.student_id,
          a.counsellor_id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.meeting_link,
          a.notes,
          a.created_at,

          u.full_name AS counsellor_name,
          u.email AS counsellor_email,

          c.specialization,
          c.experience_years,
          c.qualification,
          c.consultation_fee

        FROM appointments a

        JOIN counsellors c
          ON a.counsellor_id = c.id

        JOIN users u
          ON c.user_id = u.id

        WHERE a.student_id = $1

        ORDER BY
          a.appointment_date DESC,
          a.start_time DESC
        `,
        [studentId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Get student appointments error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch appointments.",
      });
    }
  };


// =====================================================
// CANCEL APPOINTMENT
// =====================================================

const cancelAppointment =
  async (req, res) => {
    try {
      const { id } = req.params;

      // Use authenticated user ID from JWT
      const user_id = req.user.id;

      // =================================================
      // FIND STUDENT
      // =================================================

      const studentResult =
        await pool.query(
          `
          SELECT id
          FROM students
          WHERE user_id = $1
          `,
          [user_id]
        );

      if (
        studentResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      const studentId =
        studentResult.rows[0].id;

      // =================================================
      // GET APPOINTMENT
      // =================================================

      const appointmentResult =
        await pool.query(
          `
          SELECT
            a.id,
            a.status,
            u.full_name AS counsellor_name
          FROM appointments a
          JOIN counsellors c
            ON a.counsellor_id = c.id
          JOIN users u
            ON c.user_id = u.id
          WHERE a.id = $1
            AND a.student_id = $2
          `,
          [id, studentId]
        );

      if (
        appointmentResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found.",
        });
      }

      const appointment =
        appointmentResult.rows[0];

      // =================================================
      // CHECK STATUS
      // =================================================

      if (
        appointment.status !==
          "scheduled" &&
        appointment.status !==
          "rescheduled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only scheduled or rescheduled appointments can be cancelled.",
        });
      }

      // =================================================
      // CANCEL APPOINTMENT
      // =================================================

      const result = await pool.query(
        `
        UPDATE appointments
        SET status = 'cancelled'
        WHERE id = $1
          AND student_id = $2
          AND status IN (
            'scheduled',
            'rescheduled'
          )
        RETURNING *
        `,
        [id, studentId]
      );

      if (result.rows.length === 0) {
        return res.status(409).json({
          success: false,
          message:
            "Appointment could not be cancelled. It may have already been updated.",
        });
      }

      // =================================================
      // CREATE CANCELLATION NOTIFICATION
      // =================================================

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
          user_id,
          "Appointment Cancelled",
          `Your counselling appointment with ${appointment.counsellor_name} has been cancelled.`,
        ]
      );

      res.json({
        success: true,
        message:
          "Appointment cancelled successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to cancel appointment.",
      });
    }
  };


// =====================================================
// RESCHEDULE APPOINTMENT
// =====================================================

const rescheduleAppointment =
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        appointment_date,
        start_time,
        end_time,
      } = req.body;

      // Use authenticated user ID from JWT
      const user_id = req.user.id;

      // =================================================
      // VALIDATE INPUT
      // =================================================

      if (
        !appointment_date ||
        !start_time ||
        !end_time
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All reschedule fields are required.",
        });
      }

      if (start_time >= end_time) {
        return res.status(400).json({
          success: false,
          message:
            "End time must be after start time.",
        });
      }

      // =================================================
      // FIND STUDENT
      // =================================================

      const studentResult =
        await pool.query(
          `
          SELECT id
          FROM students
          WHERE user_id = $1
          `,
          [user_id]
        );

      if (
        studentResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      const studentId =
        studentResult.rows[0].id;

      // =================================================
      // GET APPOINTMENT
      // =================================================

      const appointmentResult =
        await pool.query(
          `
          SELECT
            a.id,
            a.counsellor_id,
            a.status,
            u.full_name AS counsellor_name
          FROM appointments a
          JOIN counsellors c
            ON a.counsellor_id = c.id
          JOIN users u
            ON c.user_id = u.id
          WHERE a.id = $1
            AND a.student_id = $2
          `,
          [id, studentId]
        );

      if (
        appointmentResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found.",
        });
      }

      const appointment =
        appointmentResult.rows[0];

      // =================================================
      // CHECK STATUS
      // =================================================

      if (
        appointment.status !==
          "scheduled" &&
        appointment.status !==
          "rescheduled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only scheduled or rescheduled appointments can be rescheduled.",
        });
      }

      // =================================================
      // CHECK OVERLAPPING APPOINTMENTS
      // =================================================

      const overlapResult =
        await pool.query(
          `
          SELECT id
          FROM appointments
          WHERE counsellor_id = $1
            AND appointment_date = $2
            AND id != $3
            AND status NOT IN ('cancelled')
            AND start_time < $5
            AND end_time > $4
          `,
          [
            appointment.counsellor_id,
            appointment_date,
            id,
            start_time,
            end_time,
          ]
        );

      if (
        overlapResult.rows.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This counsellor already has an appointment during the selected time.",
        });
      }

      // =================================================
      // UPDATE APPOINTMENT
      // =================================================

      const result = await pool.query(
        `
        UPDATE appointments
        SET
          appointment_date = $1,
          start_time = $2,
          end_time = $3,
          status = 'rescheduled'
        WHERE id = $4
          AND student_id = $5
          AND status IN (
            'scheduled',
            'rescheduled'
          )
        RETURNING *
        `,
        [
          appointment_date,
          start_time,
          end_time,
          id,
          studentId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(409).json({
          success: false,
          message:
            "Appointment could not be rescheduled. It may have already been updated.",
        });
      }

      // =================================================
      // CREATE RESCHEDULE NOTIFICATION
      // =================================================

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
          user_id,
          "Appointment Rescheduled",
          `Your counselling appointment with ${appointment.counsellor_name} has been rescheduled successfully.`,
        ]
      );

      res.json({
        success: true,
        message:
          "Appointment rescheduled successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Reschedule appointment error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to reschedule appointment.",
      });
    }
  };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createAppointment,
  getStudentAppointments,
  cancelAppointment,
  rescheduleAppointment,
};