const pool = require("../config/database");

// =====================================================
// GET COUNSELLOR AVAILABILITY
// =====================================================

const getCounsellorAvailability = async (req, res) => {
  try {
    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    // Find counsellor linked to authenticated user
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
      [counsellorId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get counsellor availability error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch counsellor availability.",
    });
  }
};

// =====================================================
// ADD COUNSELLOR AVAILABILITY
// =====================================================

const addCounsellorAvailability = async (
  req,
  res
) => {
  try {
    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    const {
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (
      !day_of_week ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Day, start time and end time are required.",
      });
    }

    // -------------------------------------------------
    // Validate time range
    // -------------------------------------------------

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message:
          "Start time must be before end time.",
      });
    }

    // -------------------------------------------------
    // Find counsellor
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
    // Prevent overlapping availability
    // -------------------------------------------------

    const overlapResult = await pool.query(
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
        counsellorId,
        day_of_week,
        start_time,
        end_time,
      ]
    );

    if (overlapResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This availability overlaps with an existing time slot.",
      });
    }

    // -------------------------------------------------
    // Insert availability
    // -------------------------------------------------

    const result = await pool.query(
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
      ($1, $2, $3, $4, true)
      RETURNING *
      `,
      [
        counsellorId,
        day_of_week,
        start_time,
        end_time,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Availability added successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Add counsellor availability error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add counsellor availability.",
    });
  }
};

// =====================================================
// UPDATE COUNSELLOR AVAILABILITY
// =====================================================

const updateCounsellorAvailability = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    const {
      day_of_week,
      start_time,
      end_time,
      is_available,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (
      !day_of_week ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Day, start time and end time are required.",
      });
    }

    // -------------------------------------------------
    // Validate time range
    // -------------------------------------------------

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message:
          "Start time must be before end time.",
      });
    }

    // -------------------------------------------------
    // Find counsellor
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
    // Check overlapping availability
    // -------------------------------------------------

    const overlapResult = await pool.query(
      `
      SELECT id
      FROM counsellor_availability
      WHERE counsellor_id = $1
        AND day_of_week = $2
        AND id <> $3
        AND is_available = true
        AND start_time < $5
        AND end_time > $4
      `,
      [
        counsellorId,
        day_of_week,
        id,
        start_time,
        end_time,
      ]
    );

    if (overlapResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This availability overlaps with another existing slot.",
      });
    }

    // -------------------------------------------------
    // Update availability
    // -------------------------------------------------

    const result = await pool.query(
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
        day_of_week,
        start_time,
        end_time,
        is_available !== undefined
          ? is_available
          : true,
        id,
        counsellorId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Availability record not found.",
      });
    }

    res.json({
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

    res.status(500).json({
      success: false,
      message:
        "Failed to update counsellor availability.",
    });
  }
};

// =====================================================
// DELETE COUNSELLOR AVAILABILITY
// =====================================================

const deleteCounsellorAvailability = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    // -------------------------------------------------
    // Find counsellor
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
    // Delete only own availability
    // -------------------------------------------------

    const result = await pool.query(
      `
      DELETE FROM counsellor_availability
      WHERE id = $1
        AND counsellor_id = $2
      RETURNING *
      `,
      [id, counsellorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Availability record not found.",
      });
    }

    res.json({
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

    res.status(500).json({
      success: false,
      message:
        "Failed to delete counsellor availability.",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCounsellorAvailability,
  addCounsellorAvailability,
  updateCounsellorAvailability,
  deleteCounsellorAvailability,
};