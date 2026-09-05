const pool = require("../config/database");

const getAvailableSlots = async (req, res) => {
  try {
    const { counsellor_id } = req.params;
    const { date } = req.query;

    if (!counsellor_id) {
      return res.status(400).json({
        success: false,
        message: "Counsellor ID is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required.",
      });
    }

    // Validate date
    const selectedDate = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
      });
    }

    // Prevent past dates
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot view slots for a past date.",
      });
    }

    // Find counsellor using counsellor ID
    const counsellorResult = await pool.query(
      `
      SELECT
        c.id,
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
      WHERE c.id = $1
        AND c.is_verified = true
      `,
      [counsellor_id]
    );

    if (counsellorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor not found.",
      });
    }

    const counsellor =
      counsellorResult.rows[0];

    // Find day of week
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayOfWeek =
      days[selectedDate.getDay()];

    // Get counsellor availability
    const availabilityResult =
      await pool.query(
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
          AND is_available = true
        ORDER BY start_time
        `,
        [
          counsellor.id,
          dayOfWeek,
        ]
      );

    // No availability on this day
    if (
      availabilityResult.rows.length === 0
    ) {
      return res.json({
        success: true,
        data: {
          counsellor,
          date,
          day_of_week: dayOfWeek,
          slots: [],
        },
      });
    }

    // Get booked appointments
    const appointmentsResult =
      await pool.query(
        `
        SELECT
          start_time,
          end_time,
          status
        FROM appointments
        WHERE counsellor_id = $1
          AND appointment_date = $2
          AND status IN (
            'scheduled',
            'rescheduled'
          )
        ORDER BY start_time
        `,
        [
          counsellor.id,
          date,
        ]
      );

    const bookedAppointments =
      appointmentsResult.rows;

    const slots = [];

    // Generate 30-minute slots
    for (const availability of availabilityResult.rows) {
      let currentTime =
        availability.start_time;

      const endTime =
        availability.end_time;

      while (currentTime < endTime) {
        const [
          hours,
          minutes,
        ] = currentTime
          .split(":")
          .map(Number);

        let nextHours = hours;

        let nextMinutes =
          minutes + 30;

        if (nextMinutes >= 60) {
          nextHours += Math.floor(
            nextMinutes / 60
          );

          nextMinutes =
            nextMinutes % 60;
        }

        const nextTime =
          `${String(nextHours).padStart(
            2,
            "0"
          )}:${String(
            nextMinutes
          ).padStart(
            2,
            "0"
          )}:00`;

        // Don't create a slot beyond availability
        if (nextTime > endTime) {
          break;
        }

        // Check if slot is booked
        const isBooked =
          bookedAppointments.some(
            (appointment) => {
              return (
                appointment.start_time <
                  nextTime &&
                appointment.end_time >
                  currentTime
              );
            }
          );

        slots.push({
          start_time: currentTime,
          end_time: nextTime,
          is_available: !isBooked,
        });

        currentTime = nextTime;
      }
    }

    res.json({
      success: true,
      data: {
        counsellor,
        date,
        day_of_week: dayOfWeek,
        slots,
      },
    });
  } catch (error) {
    console.error(
      "Get available slots error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch available slots.",
    });
  }
};

module.exports = {
  getAvailableSlots,
};