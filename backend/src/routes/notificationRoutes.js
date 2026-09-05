const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// STUDENT NOTIFICATION ROUTES
// All routes require:
// 1. Valid JWT
// 2. Student role
// =====================================================

// Get notifications for a student
router.get(
  "/student/:user_id",
  authMiddleware,
  requireRole("student"),
  getStudentNotifications
);

// Mark one notification as read
router.patch(
  "/:id/read",
  authMiddleware,
  requireRole("student"),
  markNotificationAsRead
);

// Mark all notifications as read
router.patch(
  "/student/:user_id/read-all",
  authMiddleware,
  requireRole("student"),
  markAllNotificationsAsRead
);

module.exports = router;