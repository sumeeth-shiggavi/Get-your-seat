const express = require("express");

const {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// Get notifications for a student
router.get(
  "/student/:user_id",
  getStudentNotifications
);

// Mark one notification as read
router.patch(
  "/:id/read",
  markNotificationAsRead
);

// Mark all notifications as read
router.patch(
  "/student/:user_id/read-all",
  markAllNotificationsAsRead
);

module.exports = router;