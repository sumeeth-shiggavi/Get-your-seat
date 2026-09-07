const pool = require("../config/database");

// =====================================================
// CONSTANTS
// =====================================================

const BOOKING_DURATION_MINUTES = 30;
const MAX_BOOKING_DAYS = 60;

// =====================================================
// HELPERS
// =====================================================

const cleanText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  const dateString = String(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00`);

  return !Number.isNaN(date.getTime());
};

const isValidTime = (value) => {
  if (!value) {
    return false;
  }

  return /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(
    String(value)
  );
};

const timeToMinutes = (value) => {
  const parts = String(value)
    .split(":")
    .map(Number);

  return (
    parts[0] * 60 +
    parts[1]
  );
};

const formatTimeForDatabase = (value) => {
  const parts = String(value).split(":");

  const hours = String(
    Number(parts[0])
  ).padStart(2, "0");

  const minutes = String(
    Number(parts[1])
  ).padStart(2, "0");

  return `${hours}:${minutes}:00`;
};

const isThirtyMinuteBoundary = (
  value
) => {
  if (!isValidTime(value)) {
    return false;
  }

  const minutes = Number(
    String(value).split(":")[1]
  );

  return minutes % 30 === 0;
};

const getDateString = (
  value
) => {
  if (!value) {
    return "";
  }

  return String(value).substring(
    0,
    10
  );
};

const combineDateAndTime = (
  date,
  time
) => {
  return new Date(
    `${getDateString(date)}T${String(
      time
    ).substring(0, 8)}`
  );
};

const findStudentByUserId = async (
  client,
  userId
) => {
  const result =
    await client.query(
      `
        SELECT
          id,
          user_id
        FROM students
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

  return result.rows[0] || null;
};

const findVerifiedCounsellor = async (
  client,
  counsellorId
) => {
  const result =
    await client.query(
      `
        SELECT
          id,
          user_id,
          specialization,
          experience_years,
          qualification,
          bio,
          consultation_fee,
          is_verified
        FROM counsellors
        WHERE id = $1
          AND is_verified = TRUE
        LIMIT 1
      `,
      [counsellorId]
    );

  return result.rows[0] || null;
};

// =====================================================
// CHECK COUNSELLOR AVAILABILITY
// =====================================================

const checkCounsellorAvailability =
  async (
    client,
    counsellorId,
    appointmentDate,
    startTime,
    endTime
  ) => {
    const dateObject =
      new Date(
        `${appointmentDate}T00:00:00`
      );

    const dayOfWeek =
      dateObject.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        }
      );

    const result =
      await client.query(
        `
          SELECT
            id,
            day_of_week,
            start_time,
            end_time,
            is_available
          FROM counsellor_availability
          WHERE counsellor_id = $1
            AND day_of_week = $2
            AND is_available = TRUE
            AND start_time <= $3::time
            AND end_time >= $4::time
          LIMIT 1
        `,
        [
          counsellorId,
          dayOfWeek,
          startTime,
          endTime,
        ]
      );

    return (
      result.rows.length >
      0
    );
  };

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async (
  client,
  userId,
  title,
  message
) => {
  if (!userId) {
    return;
  }

  await client.query(
    `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        is_read,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        FALSE,
        CURRENT_TIMESTAMP
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
// CREATE APPOINTMENT
// =====================================================

const createAppointment = async (
  req,
  res
) => {
  const client =
    await pool.connect();

  try {
    const {
      counsellor_id,
      appointment_date,
      start_time,
      end_time,
      notes,
    } = req.body;

    const userId =
      req.user?.id ||
      req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user could not be identified.",
      });
    }

    if (!counsellor_id) {
      return res.status(400).json({
        success: false,
        message:
          "Counsellor is required.",
      });
    }

    if (
      !isValidDate(
        appointment_date
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid appointment date is required.",
      });
    }

    if (
      !isValidTime(
        start_time
      ) ||
      !isValidTime(
        end_time
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid start and end times are required.",
      });
    }

    if (
      !isThirtyMinuteBoundary(
        start_time
      ) ||
      !isThirtyMinuteBoundary(
        end_time
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointments must start and end on 30-minute boundaries.",
      });
    }

    const startMinutes =
      timeToMinutes(
        start_time
      );

    const endMinutes =
      timeToMinutes(
        end_time
      );

    if (
      endMinutes -
        startMinutes !==
      BOOKING_DURATION_MINUTES
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointments must be exactly 30 minutes long.",
      });
    }

    const today = new Date();

    const todayDateString =
      today
        .toISOString()
        .substring(
          0,
          10
        );

    const minimumDate =
      new Date(
        `${todayDateString}T00:00:00`
      );

    const maximumDate =
      new Date(
        minimumDate
      );

    maximumDate.setDate(
      maximumDate.getDate() +
        MAX_BOOKING_DAYS
    );

    const requestedDate =
      new Date(
        `${appointment_date}T00:00:00`
      );

    if (
      Number.isNaN(
        requestedDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment date.",
      });
    }

    if (
      requestedDate <
        minimumDate ||
      requestedDate >
        maximumDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Appointments can only be booked within the next ${MAX_BOOKING_DAYS} days.`,
      });
    }

    const appointmentDateTime =
      combineDateAndTime(
        appointment_date,
        start_time
      );

    if (
      appointmentDateTime <=
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment time must be in the future.",
      });
    }

    await client.query(
      "BEGIN"
    );

    // -----------------------------------------------
    // FIND STUDENT
    // -----------------------------------------------

    const student =
      await findStudentByUserId(
        client,
        userId
      );

    if (!student) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(404).json({
        success: false,
        message:
          "Student profile not found.",
      });
    }

    // -----------------------------------------------
    // FIND COUNSELLOR
    // -----------------------------------------------

    const counsellor =
      await findVerifiedCounsellor(
        client,
        counsellor_id
      );

    if (!counsellor) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(404).json({
        success: false,
        message:
          "Verified counsellor not found.",
      });
    }

    // -----------------------------------------------
    // CHECK AVAILABILITY
    // -----------------------------------------------

    const formattedStartTime =
      formatTimeForDatabase(
        start_time
      );

    const formattedEndTime =
      formatTimeForDatabase(
        end_time
      );

    const isAvailable =
      await checkCounsellorAvailability(
        client,
        counsellor.id,
        appointment_date,
        formattedStartTime,
        formattedEndTime
      );

    if (!isAvailable) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,
        message:
          "The counsellor is not available during this time.",
      });
    }

    // -----------------------------------------------
    // CHECK COUNSELLOR OVERLAP
    // -----------------------------------------------

    const counsellorConflict =
      await client.query(
        `
          SELECT
            id
          FROM appointments
          WHERE counsellor_id = $1
            AND appointment_date = $2
            AND status IN
              (
                'scheduled',
                'rescheduled'
              )
            AND start_time < $4::time
            AND end_time > $3::time
          LIMIT 1
        `,
        [
          counsellor.id,
          appointment_date,
          formattedStartTime,
          formattedEndTime,
        ]
      );

    if (
      counsellorConflict.rows
        .length > 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,
        message:
          "This time slot has already been booked.",
      });
    }

    // -----------------------------------------------
    // CHECK STUDENT OVERLAP
    // -----------------------------------------------

    const studentConflict =
      await client.query(
        `
          SELECT
            id
          FROM appointments
          WHERE student_id = $1
            AND appointment_date = $2
            AND status IN
              (
                'scheduled',
                'rescheduled'
              )
            AND start_time < $4::time
            AND end_time > $3::time
          LIMIT 1
        `,
        [
          student.id,
          appointment_date,
          formattedStartTime,
          formattedEndTime,
        ]
      );

    if (
      studentConflict.rows
        .length > 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        success: false,
        message:
          "You already have another appointment during this time.",
      });
    }

    // -----------------------------------------------
    // CREATE APPOINTMENT
    // -----------------------------------------------

    const appointmentResult =
      await client.query(
        `
          INSERT INTO appointments
          (
            student_id,
            counsellor_id,
            appointment_date,
            start_time,
            end_time,
            status,
            meeting_link,
            notes,
            created_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            'scheduled',
            NULL,
            $6,
            CURRENT_TIMESTAMP
          )
          RETURNING
            id,
            student_id,
            counsellor_id,
            appointment_date,
            start_time,
            end_time,
            status,
            meeting_link,
            notes,
            created_at
        `,
        [
          student.id,
          counsellor.id,
          appointment_date,
          formattedStartTime,
          formattedEndTime,
          cleanText(notes) ||
            null,
        ]
      );

    const appointment =
      appointmentResult.rows[0];

    // -----------------------------------------------
    // STUDENT NOTIFICATION
    // -----------------------------------------------

    await createNotification(
      client,
      userId,
      "Counselling appointment booked",
      `Your counselling appointment is scheduled for ${appointment_date} from ${formattedStartTime.substring(
        0,
        5
      )} to ${formattedEndTime.substring(
        0,
        5
      )}.`
    );

    // -----------------------------------------------
    // COUNSELLOR NOTIFICATION
    // -----------------------------------------------

    await createNotification(
      client,
      counsellor.user_id,
      "New counselling appointment",
      `A student has booked a counselling appointment with you for ${appointment_date} from ${formattedStartTime.substring(
        0,
        5
      )} to ${formattedEndTime.substring(
        0,
        5
      )}.`
    );

    await client.query(
      "COMMIT"
    );

    return res.status(201).json({
      success: true,
      message:
        "Appointment booked successfully.",
      data: appointment,
    });
  } catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError.message
      );
    }

    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create appointment.",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// GET STUDENT APPOINTMENTS
// =====================================================

const getStudentAppointments =
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const requestedUserId =
        req.params.user_id;

      const authenticatedUserId =
        req.user?.id ||
        req.user?.user_id;

      if (
        String(
          requestedUserId
        ) !==
        String(
          authenticatedUserId
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view these appointments.",
        });
      }

      const student =
        await findStudentByUserId(
          client,
          authenticatedUserId
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      const result =
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
              a.meeting_link,
              a.notes,
              a.created_at,

              c.specialization,
              c.experience_years,
              c.qualification,
              c.bio,
              c.consultation_fee,
              c.is_verified,

              u.full_name AS counsellor_name,
              u.email AS counsellor_email,
              u.phone AS counsellor_phone

            FROM appointments a

            INNER JOIN counsellors c
              ON c.id = a.counsellor_id

            INNER JOIN users u
              ON u.id = c.user_id

            WHERE a.student_id = $1

            ORDER BY
              a.appointment_date DESC,
              a.start_time DESC,
              a.id DESC
          `,
          [student.id]
        );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Get student appointments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch appointments.",
      });
    } finally {
      client.release();
    }
  };

// =====================================================
// CANCEL APPOINTMENT
// =====================================================

const cancelAppointment =
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const appointmentId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?.user_id;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Appointment ID is required.",
        });
      }

      const student =
        await findStudentByUserId(
          client,
          userId
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      const appointmentResult =
        await client.query(
          `
            SELECT
              a.*,
              c.user_id AS counsellor_user_id,
              u.full_name AS counsellor_name
            FROM appointments a

            INNER JOIN counsellors c
              ON c.id = a.counsellor_id

            INNER JOIN users u
              ON u.id = c.user_id

            WHERE a.id = $1
              AND a.student_id = $2
            LIMIT 1
          `,
          [
            appointmentId,
            student.id,
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
        appointment.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Appointment is already cancelled.",
        });
      }

      if (
        appointment.status ===
        "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed appointments cannot be cancelled.",
        });
      }

      const appointmentDateTime =
        combineDateAndTime(
          appointment.appointment_date,
          appointment.start_time
        );

      if (
        appointmentDateTime <=
        new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Past appointments cannot be cancelled.",
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
              status = 'cancelled'
            WHERE id = $1
              AND student_id = $2
            RETURNING
              id,
              appointment_date,
              start_time,
              end_time,
              status
          `,
          [
            appointmentId,
            student.id,
          ]
        );

      if (
        updateResult.rows
          .length === 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Appointment could not be cancelled.",
        });
      }

      await createNotification(
        client,
        userId,
        "Appointment cancelled",
        `Your counselling appointment on ${getDateString(
          appointment.appointment_date
        )} has been cancelled.`
      );

      await createNotification(
        client,
        appointment.counsellor_user_id,
        "Appointment cancelled",
        `A student has cancelled the counselling appointment scheduled for ${getDateString(
          appointment.appointment_date
        )}.`
      );

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Appointment cancelled successfully.",
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
          rollbackError.message
        );
      }

      console.error(
        "Cancel appointment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel appointment.",
      });
    } finally {
      client.release();
    }
  };

// =====================================================
// RESCHEDULE APPOINTMENT
// =====================================================

const rescheduleAppointment =
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const appointmentId =
        req.params.id;

      const {
        appointment_date,
        start_time,
        end_time,
      } = req.body;

      const userId =
        req.user?.id ||
        req.user?.user_id;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Appointment ID is required.",
        });
      }

      if (
        !isValidDate(
          appointment_date
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid appointment date is required.",
        });
      }

      if (
        !isValidTime(
          start_time
        ) ||
        !isValidTime(
          end_time
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid start and end times are required.",
        });
      }

      if (
        !isThirtyMinuteBoundary(
          start_time
        ) ||
        !isThirtyMinuteBoundary(
          end_time
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Appointments must start and end on 30-minute boundaries.",
        });
      }

      const startMinutes =
        timeToMinutes(
          start_time
        );

      const endMinutes =
        timeToMinutes(
          end_time
        );

      if (
        endMinutes -
          startMinutes !==
        BOOKING_DURATION_MINUTES
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Appointments must be exactly 30 minutes long.",
        });
      }

      const student =
        await findStudentByUserId(
          client,
          userId
        );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      const appointmentResult =
        await client.query(
          `
            SELECT
              a.*,
              c.user_id AS counsellor_user_id
            FROM appointments a

            INNER JOIN counsellors c
              ON c.id = a.counsellor_id

            WHERE a.id = $1
              AND a.student_id = $2
            LIMIT 1
          `,
          [
            appointmentId,
            student.id,
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
        appointment.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled appointments cannot be rescheduled.",
        });
      }

      if (
        appointment.status ===
        "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed appointments cannot be rescheduled.",
        });
      }

      const currentAppointmentTime =
        combineDateAndTime(
          appointment.appointment_date,
          appointment.start_time
        );

      if (
        currentAppointmentTime <=
        new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Past appointments cannot be rescheduled.",
        });
      }

      const today =
        new Date();

      const todayDateString =
        today
          .toISOString()
          .substring(
            0,
            10
          );

      const minimumDate =
        new Date(
          `${todayDateString}T00:00:00`
        );

      const maximumDate =
        new Date(
          minimumDate
        );

      maximumDate.setDate(
        maximumDate.getDate() +
          MAX_BOOKING_DAYS
      );

      const requestedDate =
        new Date(
          `${appointment_date}T00:00:00`
        );

      if (
        requestedDate <
          minimumDate ||
        requestedDate >
          maximumDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Appointments can only be scheduled within the next ${MAX_BOOKING_DAYS} days.`,
        });
      }

      const newAppointmentTime =
        combineDateAndTime(
          appointment_date,
          start_time
        );

      if (
        newAppointmentTime <=
        new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New appointment time must be in the future.",
        });
      }

      const formattedStartTime =
        formatTimeForDatabase(
          start_time
        );

      const formattedEndTime =
        formatTimeForDatabase(
          end_time
        );

      await client.query(
        "BEGIN"
      );

      // -----------------------------------------------
      // CHECK COUNSELLOR AVAILABILITY
      // -----------------------------------------------

      const isAvailable =
        await checkCounsellorAvailability(
          client,
          appointment.counsellor_id,
          appointment_date,
          formattedStartTime,
          formattedEndTime
        );

      if (!isAvailable) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "The counsellor is not available during this time.",
        });
      }

      // -----------------------------------------------
      // CHECK COUNSELLOR CONFLICT
      // -----------------------------------------------

      const counsellorConflict =
        await client.query(
          `
            SELECT
              id
            FROM appointments
            WHERE counsellor_id = $1
              AND appointment_date = $2
              AND id <> $3
              AND status IN
                (
                  'scheduled',
                  'rescheduled'
                )
              AND start_time < $5::time
              AND end_time > $4::time
            LIMIT 1
          `,
          [
            appointment.counsellor_id,
            appointment_date,
            appointmentId,
            formattedStartTime,
            formattedEndTime,
          ]
        );

      if (
        counsellorConflict.rows
          .length > 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "The selected time slot has already been booked.",
        });
      }

      // -----------------------------------------------
      // CHECK STUDENT CONFLICT
      // -----------------------------------------------

      const studentConflict =
        await client.query(
          `
            SELECT
              id
            FROM appointments
            WHERE student_id = $1
              AND appointment_date = $2
              AND id <> $3
              AND status IN
                (
                  'scheduled',
                  'rescheduled'
                )
              AND start_time < $5::time
              AND end_time > $4::time
            LIMIT 1
          `,
          [
            student.id,
            appointment_date,
            appointmentId,
            formattedStartTime,
            formattedEndTime,
          ]
        );

      if (
        studentConflict.rows
          .length > 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "You already have another appointment during this time.",
        });
      }

      // -----------------------------------------------
      // UPDATE APPOINTMENT
      // -----------------------------------------------

      const updateResult =
        await client.query(
          `
            UPDATE appointments
            SET
              appointment_date = $1,
              start_time = $2,
              end_time = $3,
              status = 'rescheduled'
            WHERE id = $4
              AND student_id = $5
            RETURNING
              id,
              student_id,
              counsellor_id,
              appointment_date,
              start_time,
              end_time,
              status,
              meeting_link,
              notes,
              created_at
          `,
          [
            appointment_date,
            formattedStartTime,
            formattedEndTime,
            appointmentId,
            student.id,
          ]
        );

      if (
        updateResult.rows
          .length === 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Appointment could not be rescheduled.",
        });
      }

      const updatedAppointment =
        updateResult.rows[0];

      // -----------------------------------------------
      // NOTIFICATIONS
      // -----------------------------------------------

      await createNotification(
        client,
        userId,
        "Appointment rescheduled",
        `Your counselling appointment has been rescheduled to ${appointment_date} from ${formattedStartTime.substring(
          0,
          5
        )} to ${formattedEndTime.substring(
          0,
          5
        )}.`
      );

      await createNotification(
        client,
        appointment.counsellor_user_id,
        "Appointment rescheduled",
        `A counselling appointment has been rescheduled to ${appointment_date} from ${formattedStartTime.substring(
          0,
          5
        )} to ${formattedEndTime.substring(
          0,
          5
        )}.`
      );

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Appointment rescheduled successfully.",
        data:
          updatedAppointment,
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }

      console.error(
        "Reschedule appointment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reschedule appointment.",
      });
    } finally {
      client.release();
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