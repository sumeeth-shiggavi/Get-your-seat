const pool = require("../config/database");

// =====================================================
// HELPERS
// =====================================================

const timeToMinutes = (time) => {
  if (!time) {
    return null;
  }

  const parts = String(time)
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

const isValidDay = (day) => {
  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return validDays.includes(day);
};

const isValidTime = (time) => {
  if (
    typeof time !== "string" ||
    !/^\d{2}:\d{2}(:\d{2})?$/.test(
      time
    )
  ) {
    return false;
  }

  const minutes =
    timeToMinutes(time);

  if (minutes === null) {
    return false;
  }

  const [hours, mins] =
    time
      .substring(0, 5)
      .split(":")
      .map(Number);

  return (
    hours >= 0 &&
    hours <= 23 &&
    mins >= 0 &&
    mins <= 59
  );
};

const isThirtyMinuteBoundary = (
  time
) => {
  const minutes =
    timeToMinutes(time);

  if (minutes === null) {
    return false;
  }

  return minutes % 30 === 0;
};

const validateTimeRange = (
  startTime,
  endTime
) => {
  if (
    !isValidTime(startTime) ||
    !isValidTime(endTime)
  ) {
    return {
      valid: false,
      message:
        "Invalid start or end time.",
    };
  }

  if (
    !isThirtyMinuteBoundary(
      startTime
    ) ||
    !isThirtyMinuteBoundary(
      endTime
    )
  ) {
    return {
      valid: false,
      message:
        "Availability times must be on 30-minute boundaries, such as 09:00, 09:30 or 10:00.",
    };
  }

  const start =
    timeToMinutes(startTime);

  const end =
    timeToMinutes(endTime);

  if (start >= end) {
    return {
      valid: false,
      message:
        "End time must be later than start time.",
    };
  }

  if (
    end - start < 30
  ) {
    return {
      valid: false,
      message:
        "Availability must be at least 30 minutes.",
    };
  }

  return {
    valid: true,
  };
};

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
          c.is_verified
        FROM counsellors c
        WHERE c.user_id = $1
        `,
        [userId]
      );

    return (
      result.rows[0] || null
    );
  };

// =====================================================
// GET AVAILABILITY
// =====================================================

const getAvailability =
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

      const result =
        await pool.query(
          `
          SELECT
            id,
            counsellor_id,
            day_of_week,
            start_time,
            end_time,
            is_available,
            created_at
          FROM counsellor_availability
          WHERE counsellor_id = $1
          ORDER BY
            CASE day_of_week
              WHEN 'Monday' THEN 1
              WHEN 'Tuesday' THEN 2
              WHEN 'Wednesday' THEN 3
              WHEN 'Thursday' THEN 4
              WHEN 'Friday' THEN 5
              WHEN 'Saturday' THEN 6
              WHEN 'Sunday' THEN 7
            END,
            start_time
          `,
          [counsellor.id]
        );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Get counsellor availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch availability.",
      });
    }
  };

// =====================================================
// CREATE AVAILABILITY
// =====================================================

const createAvailability =
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

      if (
        counsellor.is_verified !==
        true
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only verified counsellors can manage availability.",
        });
      }

      const {
        day_of_week,
        start_time,
        end_time,
        is_available,
      } = req.body;

      // =================================================
      // VALIDATE DAY
      // =================================================

      if (
        !isValidDay(day_of_week)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid day of week.",
        });
      }

      // =================================================
      // VALIDATE TIME RANGE
      // =================================================

      const validation =
        validateTimeRange(
          start_time,
          end_time
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }

      const available =
        is_available === undefined
          ? true
          : Boolean(is_available);

      // =================================================
      // CHECK OVERLAPPING AVAILABILITY
      // =================================================

      const overlapResult =
        await pool.query(
          `
          SELECT id
          FROM counsellor_availability
          WHERE counsellor_id = $1
            AND day_of_week = $2
            AND is_available = true
            AND start_time < $4
            AND end_time > $3
          `,
          [
            counsellor.id,
            day_of_week,
            start_time,
            end_time,
          ]
        );

      if (
        overlapResult.rows.length >
        0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This availability overlaps with an existing availability period.",
        });
      }

      // =================================================
      // INSERT
      // =================================================

      const result =
        await pool.query(
          `
          INSERT INTO counsellor_availability
          (
            counsellor_id,
            day_of_week,
            start_time,
            end_time,
            is_available
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5
          )
          RETURNING *
          `,
          [
            counsellor.id,
            day_of_week,
            start_time,
            end_time,
            available,
          ]
        );

      return res.status(201).json({
        success: true,
        message:
          "Availability added successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create counsellor availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create availability.",
      });
    }
  };

// =====================================================
// UPDATE AVAILABILITY
// =====================================================

const updateAvailability =
  async (req, res) => {
    try {
      const userId =
        req.user?.id;

      const { id } =
        req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const availabilityId =
        Number(id);

      if (
        !Number.isInteger(
          availabilityId
        ) ||
        availabilityId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid availability ID.",
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
            "Only verified counsellors can manage availability.",
        });
      }

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            day_of_week,
            start_time,
            end_time,
            is_available
          FROM counsellor_availability
          WHERE id = $1
            AND counsellor_id = $2
          `,
          [
            availabilityId,
            counsellor.id,
          ]
        );

      if (
        existingResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Availability slot not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      const {
        day_of_week,
        start_time,
        end_time,
        is_available,
      } = req.body;

      const newDay =
        day_of_week ??
        existing.day_of_week;

      const newStart =
        start_time ??
        existing.start_time;

      const newEnd =
        end_time ??
        existing.end_time;

      const newAvailable =
        is_available === undefined
          ? existing.is_available
          : Boolean(is_available);

      // =================================================
      // VALIDATE DAY
      // =================================================

      if (
        !isValidDay(newDay)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid day of week.",
        });
      }

      // =================================================
      // VALIDATE TIME RANGE
      // =================================================

      const validation =
        validateTimeRange(
          newStart,
          newEnd
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message,
        });
      }

      // =================================================
      // CHECK OVERLAP
      // =================================================

      if (newAvailable) {
        const overlapResult =
          await pool.query(
            `
            SELECT id
            FROM counsellor_availability
            WHERE counsellor_id = $1
              AND day_of_week = $2
              AND is_available = true
              AND id != $3
              AND start_time < $5
              AND end_time > $4
            `,
            [
              counsellor.id,
              newDay,
              availabilityId,
              newStart,
              newEnd,
            ]
          );

        if (
          overlapResult.rows.length >
          0
        ) {
          return res.status(409).json({
            success: false,
            message:
              "This availability overlaps with an existing availability period.",
          });
        }
      }

      // =================================================
      // UPDATE
      // =================================================

      const result =
        await pool.query(
          `
          UPDATE counsellor_availability
          SET
            day_of_week = $1,
            start_time = $2,
            end_time = $3,
            is_available = $4
          WHERE id = $5
            AND counsellor_id = $6
          RETURNING *
          `,
          [
            newDay,
            newStart,
            newEnd,
            newAvailable,
            availabilityId,
            counsellor.id,
          ]
        );

      return res.json({
        success: true,
        message:
          "Availability updated successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update counsellor availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update availability.",
      });
    }
  };

// =====================================================
// DELETE AVAILABILITY
// =====================================================

const deleteAvailability =
  async (req, res) => {
    try {
      const userId =
        req.user?.id;

      const { id } =
        req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const availabilityId =
        Number(id);

      if (
        !Number.isInteger(
          availabilityId
        ) ||
        availabilityId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid availability ID.",
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
            "Only verified counsellors can manage availability.",
        });
      }

      // =================================================
      // DELETE
      // =================================================

      const result =
        await pool.query(
          `
          DELETE FROM counsellor_availability
          WHERE id = $1
            AND counsellor_id = $2
          RETURNING *
          `,
          [
            availabilityId,
            counsellor.id,
          ]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Availability slot not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Availability deleted successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Delete counsellor availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete availability.",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};