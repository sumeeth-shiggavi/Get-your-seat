const pool = require("../config/database");

// =====================================================
// GET STUDENT NOTIFICATIONS
// =====================================================

const getStudentNotifications = async (req, res) => {
  try {
    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Mark notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    // Use authenticated user ID from JWT
    const user_id = req.user.id;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1
      `,
      [user_id]
    );

    res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

module.exports = {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};