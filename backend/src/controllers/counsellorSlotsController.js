const pool = require("../config/database");

// =====================================================
// HELPERS
// =====================================================

const timeToMinutes = (time) => {
  if (!time) {
    return null;
  }

  const parts = time
    .substring(0, 8)
    .split(":")
    .map(Number);

  if (
    parts.length < 2 ||
    Number.isNaN(parts[0]) ||
    Number.isNaN(parts[1])
  ) {
    return null;
  }

  return (
    parts[0] * 60 +
    parts[1]
  );
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(
    minutes / 60
  );

  const mins = minutes % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(mins).padStart(
    2,
    "0"
  )}:00`;
};

const isValidDateFormat = (date) => {
  return (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  );
};

const isValidCalendarDate = (
  date
) => {
  if (!isValidDateFormat(date)) {
    return false;
  }

  const parsed =
    new Date(
      `${date}T00:00:00`
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return false;
  }

  const [year, month, day] =
    date.split("-").map(Number);

  return (
    parsed.getFullYear() ===
      year &&
    parsed.getMonth() + 1 ===
      month &&
    parsed.getDate() === day
  );
};

const getDayOfWeek = (date) => {
  const selectedDate =
    new Date(
      `${date}T00:00:00`
    );

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[
    selectedDate.getDay()
  ];
};

const isPastDate = (date) => {
  const selectedDate =
    new Date(
      `${date}T00:00:00`
    );

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return selectedDate < today;
};

const isPastTimeToday = (
  date,
  startMinutes
) => {
  const selectedDate =
    new Date(
      `${date}T00:00:00`
    );

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (
    selectedDate.getTime() !==
    today.getTime()
  ) {
    return false;
  }

  const currentMinutes =
    today.getHours() * 60 +
    today.getMinutes();

  return (
    startMinutes <=
    currentMinutes
  );
};

// =====================================================
// GET AVAILABLE SLOTS
// =====================================================

const getAvailableSlots =
  async (req, res) => {
    try {
      const {
        counsellor_id,
      } = req.params;

      const { date } =
        req.query;

      // =================================================
      // AUTHENTICATION
      // =================================================

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      // =================================================
      // ROLE
      // =================================================

      if (
        req.user.role &&
        req.user.role !== "student"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only students can view counselling slots.",
        });
      }

      // =================================================
      // COUNSELLOR ID
      // =================================================

      if (!counsellor_id) {
        return res.status(400).json({
          success: false,
          message:
            "Counsellor ID is required.",
        });
      }

      const counsellorId =
        Number(counsellor_id);

      if (
        !Number.isInteger(
          counsellorId
        ) ||
        counsellorId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid counsellor ID.",
        });
      }

      // =================================================
      // DATE
      // =================================================

      if (!date) {
        return res.status(400).json({
          success: false,
          message:
            "Date is required.",
        });
      }

      if (
        !isValidCalendarDate(
          date
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid date. Use YYYY-MM-DD.",
        });
      }

      // =================================================
      // PREVENT PAST DATES
      // =================================================

      if (isPastDate(date)) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot view slots for a past date.",
        });
      }

      // =================================================
      // FIND VERIFIED COUNSELLOR
      // =================================================

      const counsellorResult =
        await pool.query(
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
          [counsellorId]
        );

      if (
        counsellorResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Verified counsellor not found.",
        });
      }

      const counsellor =
        counsellorResult.rows[0];

      // =================================================
      // DAY OF WEEK
      // =================================================

      const dayOfWeek =
        getDayOfWeek(date);

      // =================================================
      // GET AVAILABILITY
      // =================================================

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
            counsellorId,
            dayOfWeek,
          ]
        );

      // =================================================
      // NO AVAILABILITY
      // =================================================

      if (
        availabilityResult.rows.length ===
        0
      ) {
        return res.json({
          success: true,
          data: {
            counsellor,
            date,
            day_of_week:
              dayOfWeek,
            slots: [],
          },
        });
      }

      // =================================================
      // GET BOOKED APPOINTMENTS
      // =================================================

      const appointmentsResult =
        await pool.query(
          `
          SELECT
            id,
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
            counsellorId,
            date,
          ]
        );

      const bookedAppointments =
        appointmentsResult.rows;

      // =================================================
      // GENERATE 30-MINUTE SLOTS
      // =================================================

      const slots = [];

      for (
        const availability
          of availabilityResult.rows
      ) {
        const availabilityStart =
          timeToMinutes(
            availability.start_time
          );

        const availabilityEnd =
          timeToMinutes(
            availability.end_time
          );

        if (
          availabilityStart ===
            null ||
          availabilityEnd ===
            null ||
          availabilityStart >=
            availabilityEnd
        ) {
          continue;
        }

        // -----------------------------------------------
        // Generate exactly 30-minute slots
        // -----------------------------------------------

        for (
          let startMinutes =
            availabilityStart;

          startMinutes + 30 <=
          availabilityEnd;

          startMinutes += 30
        ) {
          const endMinutes =
            startMinutes + 30;

          const startTime =
            minutesToTime(
              startMinutes
            );

          const endTime =
            minutesToTime(
              endMinutes
            );

          // ---------------------------------------------
          // Check whether slot is in the past
          // ---------------------------------------------

          const isPast =
            isPastTimeToday(
              date,
              startMinutes
            );

          // ---------------------------------------------
          // Check appointment overlap
          // ---------------------------------------------

          const isBooked =
            bookedAppointments.some(
              (appointment) => {
                const bookedStart =
                  timeToMinutes(
                    appointment.start_time
                  );

                const bookedEnd =
                  timeToMinutes(
                    appointment.end_time
                  );

                if (
                  bookedStart ===
                    null ||
                  bookedEnd ===
                    null
                ) {
                  return false;
                }

                return (
                  bookedStart <
                    endMinutes &&
                  bookedEnd >
                    startMinutes
                );
              }
            );

          // ---------------------------------------------
          // Add slot
          // ---------------------------------------------

          slots.push({
            start_time:
              startTime,

            end_time:
              endTime,

            is_available:
              !isPast &&
              !isBooked,

            is_booked:
              isBooked,

            is_past:
              isPast,
          });
        }
      }

      // =================================================
      // REMOVE DUPLICATE SLOTS
      // =================================================

      const uniqueSlots = [];

      const slotKeys =
        new Set();

      for (const slot of slots) {
        const key =
          `${slot.start_time}-${slot.end_time}`;

        if (
          slotKeys.has(key)
        ) {
          continue;
        }

        slotKeys.add(key);

        uniqueSlots.push(slot);
      }

      // =================================================
      // SORT SLOTS
      // =================================================

      uniqueSlots.sort(
        (a, b) => {
          return (
            timeToMinutes(
              a.start_time
            ) -
            timeToMinutes(
              b.start_time
            )
          );
        }
      );

      // =================================================
      // RESPONSE
      // =================================================

      return res.json({
        success: true,

        data: {
          counsellor,

          date,

          day_of_week:
            dayOfWeek,

          slots:
            uniqueSlots,

          total_slots:
            uniqueSlots.length,

          available_slots:
            uniqueSlots.filter(
              (slot) =>
                slot.is_available
            ).length,

          booked_slots:
            uniqueSlots.filter(
              (slot) =>
                slot.is_booked
            ).length,
        },
      });
    } catch (error) {
      console.error(
        "Get available slots error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch available slots.",
      });
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAvailableSlots,
};