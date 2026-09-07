const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getNotices,
  getAllNoticesForCounsellor,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticePublish,
} = require("../controllers/noticeController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// PUBLIC NOTICE ROUTES
// =====================================================

// Get all published notices
// Optional query:
// /api/notices?exam=KCET
// /api/notices?exam=NEET
router.get(
  "/",
  getNotices
);

// Get notices by exam
// /api/notices/exam/KCET
// /api/notices/exam/NEET
router.get(
  "/exam/:exam",
  (req, res, next) => {
    req.query.exam =
      req.params.exam;

    next();
  },
  getNotices
);

// =====================================================
// COUNSELLOR NOTICE MANAGEMENT
// =====================================================

// Get all notices for counsellor
router.get(
  "/manage",
  authMiddleware,
  requireRole("counsellor"),
  getAllNoticesForCounsellor
);

// Create a new notice
router.post(
  "/",
  authMiddleware,
  requireRole("counsellor"),
  createNotice
);

// Update an existing notice
router.put(
  "/:id",
  authMiddleware,
  requireRole("counsellor"),
  updateNotice
);

// Delete a notice
router.delete(
  "/:id",
  authMiddleware,
  requireRole("counsellor"),
  deleteNotice
);

// Publish / Unpublish notice
router.patch(
  "/:id/publish",
  authMiddleware,
  requireRole("counsellor"),
  toggleNoticePublish
);

module.exports = router;