const pool = require("../config/database");

// =====================================================
// FIND COUNSELLOR
// =====================================================

const findCounsellorByUserId =
  async (userId) => {
    const result =
      await pool.query(
        `
        SELECT
          c.id,
          c.user_id,
          c.specialization,
          c.experience_years,
          c.qualification,
          c.bio,
          c.consultation_fee,
          c.is_verified,
          u.full_name,
          u.email,
          u.phone
        FROM counsellors c
        JOIN users u
          ON c.user_id = u.id
        WHERE c.user_id = $1
        `,
        [userId]
      );

    return (
      result.rows[0] || null
    );
  };

// =====================================================
// CREATE STUDENT NOTIFICATION
// =====================================================

const createStudentNotification =
  async (
    client,
    userId,
    title,
    message
  ) => {
    await client.query(
      `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        is_read
      )
      VALUES
      (
        $1,
        $2,
        $3,
        false
      )
      `,
      [
        userId,
        title,
        message,
      ]
    );
  };

// =====================================================
// GET COUNSELLOR DASHBOARD
// =====================================================

const getCounsellorDashboard =
  async (req, res) => {
    try {
      const userId =
        req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const counsellor =
        await findCounsellorByUserId(
          userId
        );

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      // =================================================
      // APPOINTMENTS
      // =================================================

      const appointmentsResult =
        await pool.query(
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
            a.appointment_date DESC,
            a.start_time DESC
          `,
          [counsellor.id]
        );

      const appointments =
        appointmentsResult.rows;

      // =================================================
      // STATISTICS
      // =================================================

      const totalAppointments =
        appointments.length;

      const scheduledAppointments =
        appointments.filter(
          (appointment) =>
            [
              "scheduled",
              "rescheduled",
            ].includes(
              appointment.status
            )
        ).length;

      const completedAppointments =
        appointments.filter(
          (appointment) =>
            appointment.status ===
            "completed"
        ).length;

      const cancelledAppointments =
        appointments.filter(
          (appointment) =>
            appointment.status ===
            "cancelled"
        ).length;

      // =================================================
      // TODAY'S APPOINTMENTS
      // =================================================

      const today =
        new Date();

      const todayString =
        `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(
          today.getDate()
        ).padStart(2, "0")}`;

      const todayAppointments =
        appointments.filter(
          (appointment) =>
            String(
              appointment.appointment_date
            ).substring(0, 10) ===
              todayString &&
            [
              "scheduled",
              "rescheduled",
            ].includes(
              appointment.status
            )
        );

      // =================================================
      // UPCOMING APPOINTMENTS
      // =================================================

      const upcomingAppointments =
        appointments.filter(
          (appointment) => {
            const appointmentDate =
              new Date(
                `${String(
                  appointment.appointment_date
                ).substring(
                  0,
                  10
                )}T${String(
                  appointment.start_time ||
                    "00:00:00"
                ).substring(
                  0,
                  8
                )}`
              );

            return (
              !Number.isNaN(
                appointmentDate.getTime()
              ) &&
              appointmentDate >=
                new Date() &&
              [
                "scheduled",
                "rescheduled",
              ].includes(
                appointment.status
              )
            );
          }
        );

      return res.json({
        success: true,

        data: {
          counsellor: {
            id: counsellor.id,
            user_id:
              counsellor.user_id,
            full_name:
              counsellor.full_name,
            email:
              counsellor.email,
            phone:
              counsellor.phone,
            specialization:
              counsellor.specialization,
            experience_years:
              counsellor.experience_years,
            qualification:
              counsellor.qualification,
            bio:
              counsellor.bio,
            consultation_fee:
              counsellor.consultation_fee,
            is_verified:
              counsellor.is_verified,
          },

          stats: {
            total_appointments:
              totalAppointments,

            scheduled_appointments:
              scheduledAppointments,

            completed_appointments:
              completedAppointments,

            cancelled_appointments:
              cancelledAppointments,

            today_appointments:
              todayAppointments.length,

            upcoming_appointments:
              upcomingAppointments.length,
          },

          appointments,
        },
      });
    } catch (error) {
      console.error(
        "Get counsellor dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load counsellor dashboard.",
      });
    }
  };

// =====================================================
// MARK APPOINTMENT AS COMPLETED
// =====================================================

const completeAppointment =
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const userId =
        req.user?.id;

      const appointmentId =
        Number(
          req.params.id
        );

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (
        !Number.isInteger(
          appointmentId
        ) ||
        appointmentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment ID.",
        });
      }

      const counsellor =
        await findCounsellorByUserId(
          userId
        );

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      if (
        counsellor.is_verified !==
        true
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only verified counsellors can manage appointments.",
        });
      }

      const appointmentResult =
        await client.query(
          `
          SELECT
            a.id,
            a.student_id,
            a.counsellor_id,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.status,
            s.user_id AS student_user_id
          FROM appointments a
          JOIN students s
            ON a.student_id = s.id
          WHERE a.id = $1
            AND a.counsellor_id = $2
          FOR UPDATE
          `,
          [
            appointmentId,
            counsellor.id,
          ]
        );

      if (
        appointmentResult.rows
          .length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found.",
        });
      }

      const appointment =
        appointmentResult.rows[0];

      if (
        ![
          "scheduled",
          "rescheduled",
        ].includes(
          appointment.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `This appointment cannot be completed because its current status is "${appointment.status}".`,
        });
      }

      // =================================================
      // ENSURE APPOINTMENT HAS STARTED
      // =================================================

      const appointmentDateTime =
        new Date(
          `${String(
            appointment.appointment_date
          ).substring(
            0,
            10
          )}T${String(
            appointment.start_time
          ).substring(0, 8)}`
        );

      if (
        !Number.isNaN(
          appointmentDateTime.getTime()
        ) &&
        appointmentDateTime >
          new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "An appointment cannot be marked as completed before its scheduled start time.",
        });
      }

      await client.query(
        "BEGIN"
      );

      const updateResult =
        await client.query(
          `
          UPDATE appointments
          SET
            status = 'completed'
          WHERE id = $1
            AND counsellor_id = $2
          RETURNING *
          `,
          [
            appointmentId,
            counsellor.id,
          ]
        );

      await createStudentNotification(
        client,
        appointment.student_user_id,
        "Counselling Session Completed",
        `Your counselling session with ${counsellor.full_name} has been marked as completed.`
      );

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Appointment marked as completed successfully.",
        data:
          updateResult.rows[0],
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }

      console.error(
        "Complete appointment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to complete appointment.",
      });
    } finally {
      client.release();
    }
  };

// =====================================================
// UPDATE APPOINTMENT NOTES
// =====================================================

const updateAppointmentNotes =
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const userId =
        req.user?.id;

      const appointmentId =
        Number(
          req.params.id
        );

      const notes =
        req.body?.notes;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (
        !Number.isInteger(
          appointmentId
        ) ||
        appointmentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment ID.",
        });
      }

      if (
        notes !== null &&
        notes !== undefined &&
        typeof notes !==
          "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Notes must be provided as text.",
        });
      }

      const counsellor =
        await findCounsellorByUserId(
          userId
        );

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      if (
        counsellor.is_verified !==
        true
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only verified counsellors can update appointment notes.",
        });
      }

      const appointmentResult =
        await client.query(
          `
          SELECT
            a.id,
            a.student_id,
            a.counsellor_id,
            a.status,
            s.user_id AS student_user_id
          FROM appointments a
          JOIN students s
            ON a.student_id = s.id
          WHERE a.id = $1
            AND a.counsellor_id = $2
          `,
          [
            appointmentId,
            counsellor.id,
          ]
        );

      if (
        appointmentResult.rows
          .length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found.",
        });
      }

      const appointment =
        appointmentResult.rows[0];

      const cleanNotes =
        typeof notes ===
        "string"
          ? notes.trim()
          : "";

      const result =
        await client.query(
          `
          UPDATE appointments
          SET
            notes = $1
          WHERE id = $2
            AND counsellor_id = $3
          RETURNING *
          `,
          [
            cleanNotes ||
              null,
            appointmentId,
            counsellor.id,
          ]
        );

      // =================================================
      // NOTIFY STUDENT
      // =================================================

      await client.query(
        "BEGIN"
      );

      await createStudentNotification(
        client,
        appointment.student_user_id,
        "Counselling Notes Updated",
        `Your counsellor ${counsellor.full_name} has updated the notes for your counselling appointment.`
      );

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Appointment notes updated successfully.",
        data:
          result.rows[0],
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }

      console.error(
        "Update appointment notes error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update appointment notes.",
      });
    } finally {
      client.release();
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCounsellorDashboard,
  completeAppointment,
  updateAppointmentNotes,
};