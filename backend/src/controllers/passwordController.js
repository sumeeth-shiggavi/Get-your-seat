const bcrypt = require("bcrypt");
const pool = require("../config/database");

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { user_id } = req.params;

    const {
      current_password,
      new_password,
      confirm_password,
    } = req.body;

    // -------------------------------------------------
    // Validate input
    // -------------------------------------------------

    if (
      !current_password ||
      !new_password ||
      !confirm_password
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    // -------------------------------------------------
    // Check new password
    // -------------------------------------------------

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    // -------------------------------------------------
    // Password length
    // -------------------------------------------------

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters long.",
      });
    }

    // -------------------------------------------------
    // Get current password hash
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        password_hash
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];

    // -------------------------------------------------
    // Verify current password
    // -------------------------------------------------

    const passwordMatch = await bcrypt.compare(
      current_password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // -------------------------------------------------
    // Prevent same password
    // -------------------------------------------------

    const samePassword = await bcrypt.compare(
      new_password,
      user.password_hash
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password.",
      });
    }

    // -------------------------------------------------
    // Hash new password
    // -------------------------------------------------

    const newPasswordHash = await bcrypt.hash(
      new_password,
      10
    );

    // -------------------------------------------------
    // Update password
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newPasswordHash, user_id]
    );

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

module.exports = {
  changePassword,
};