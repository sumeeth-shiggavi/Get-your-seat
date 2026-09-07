const pool = require("../config/database");

// =====================================================
// HELPERS
// =====================================================

const VALID_EXAMS = ["KCET", "NEET"];

const normalizeExam = (exam) => {
  if (!exam) {
    return null;
  }

  return String(exam)
    .trim()
    .toUpperCase();
};

const isValidDate = (value) => {
  if (!value) {
    return true;
  }

  const date = new Date(value);

  return !Number.isNaN(
    date.getTime()
  );
};

const cleanText = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const getCounsellorByUserId =
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

    if (
      result.rows.length === 0
    ) {
      return null;
    }

    return result.rows[0];
  };

// =====================================================
// GET PUBLISHED NOTICES
// =====================================================
//
// GET /api/notices
//
// Optional:
// /api/notices?exam=KCET
// /api/notices?exam=NEET
//
// =====================================================

const getNotices = async (
  req,
  res
) => {
  try {
    const exam =
      normalizeExam(
        req.query.exam
      );

    if (
      exam &&
      !VALID_EXAMS.includes(exam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam must be either KCET or NEET.",
      });
    }

    const values = [];
    let examCondition = "";

    if (exam) {
      values.push(exam);

      examCondition =
        `AND exam = $${values.length}`;
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          exam,
          title,
          summary,
          official_link,
          published_date,
          expiry_date,
          is_important,
          is_published,
          created_at,
          updated_at
        FROM notices
        WHERE is_published = TRUE
          AND (
            expiry_date IS NULL
            OR expiry_date >= CURRENT_DATE
          )
          ${examCondition}
        ORDER BY
          is_important DESC,
          published_date DESC,
          created_at DESC
        `,
        values
      );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get published notices error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notices.",
    });
  }
};

// =====================================================
// GET ALL NOTICES FOR COUNSELLOR
// =====================================================
//
// GET /api/notices/manage
//
// =====================================================

const getAllNoticesForCounsellor =
  async (req, res) => {
    try {
      const counsellor =
        await getCounsellorByUserId(
          req.user.user_id ||
            req.user.id
        );

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      if (
        !counsellor.is_verified
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only verified counsellors can manage notices.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            exam,
            title,
            summary,
            official_link,
            published_date,
            expiry_date,
            is_important,
            is_published,
            created_at,
            updated_at
          FROM notices
          WHERE created_by = $1
          ORDER BY
            published_date DESC,
            created_at DESC
          `,
          [counsellor.id]
        );

      return res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Get counsellor notices error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch counsellor notices.",
      });
    }
  };

// =====================================================
// CREATE NOTICE
// =====================================================
//
// POST /api/notices
//
// =====================================================

const createNotice = async (
  req,
  res
) => {
  const client =
    await pool.connect();

  try {
    const counsellor =
      await getCounsellorByUserId(
        req.user.user_id ||
          req.user.id
      );

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    if (
      !counsellor.is_verified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only verified counsellors can create notices.",
      });
    }

    const {
      exam,
      title,
      summary,
      official_link,
      published_date,
      expiry_date,
      is_important,
      is_published,
    } = req.body;

    const normalizedExam =
      normalizeExam(exam);

    const cleanTitle =
      cleanText(title);

    const cleanSummary =
      cleanText(summary);

    const cleanOfficialLink =
      cleanText(
        official_link
      );

    if (
      !normalizedExam ||
      !VALID_EXAMS.includes(
        normalizedExam
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam must be either KCET or NEET.",
      });
    }

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message:
          "Notice title is required.",
      });
    }

    if (!cleanSummary) {
      return res.status(400).json({
        success: false,
        message:
          "Notice summary is required.",
      });
    }

    if (
      cleanTitle.length >
      255
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notice title must not exceed 255 characters.",
      });
    }

    if (
      published_date &&
      !isValidDate(
        published_date
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid published date.",
      });
    }

    if (
      expiry_date &&
      !isValidDate(expiry_date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expiry date.",
      });
    }

    if (
      published_date &&
      expiry_date
    ) {
      const published =
        new Date(
          published_date
        );

      const expiry =
        new Date(
          expiry_date
        );

      if (expiry < published) {
        return res.status(400).json({
          success: false,
          message:
            "Expiry date cannot be before the published date.",
        });
      }
    }

    if (
      cleanOfficialLink &&
      !/^https?:\/\//i.test(
        cleanOfficialLink
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Official link must start with http:// or https://.",
      });
    }

    const important =
      is_important === true ||
      is_important === "true";

    const published =
      is_published === undefined
        ? true
        : is_published === true ||
          is_published === "true";

    await client.query(
      "BEGIN"
    );

    const result =
      await client.query(
        `
        INSERT INTO notices (
          exam,
          title,
          summary,
          official_link,
          published_date,
          expiry_date,
          is_important,
          is_published,
          created_by
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          COALESCE($5::date, CURRENT_DATE),
          $6::date,
          $7,
          $8,
          $9
        )
        RETURNING
          id,
          exam,
          title,
          summary,
          official_link,
          published_date,
          expiry_date,
          is_important,
          is_published,
          created_at,
          updated_at
        `,
        [
          normalizedExam,
          cleanTitle,
          cleanSummary,
          cleanOfficialLink ||
            null,
          published_date ||
            null,
          expiry_date ||
            null,
          important,
          published,
          counsellor.id,
        ]
      );

    await client.query(
      "COMMIT"
    );

    return res.status(201).json({
      success: true,
      message:
        "Notice created successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Create notice error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create notice.",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// UPDATE NOTICE
// =====================================================
//
// PUT /api/notices/:id
//
// =====================================================

const updateNotice = async (
  req,
  res
) => {
  const client =
    await pool.connect();

  try {
    const noticeId =
      Number(req.params.id);

    if (
      !Number.isInteger(
        noticeId
      ) ||
      noticeId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notice ID.",
      });
    }

    const counsellor =
      await getCounsellorByUserId(
        req.user.user_id ||
          req.user.id
      );

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    if (
      !counsellor.is_verified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only verified counsellors can update notices.",
      });
    }

    const existing =
      await pool.query(
        `
        SELECT
          id,
          exam,
          title,
          summary,
          official_link,
          published_date,
          expiry_date,
          is_important,
          is_published
        FROM notices
        WHERE id = $1
          AND created_by = $2
        `,
        [
          noticeId,
          counsellor.id,
        ]
      );

    if (
      existing.rows.length ===
      0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Notice not found or you are not authorized to update it.",
      });
    }

    const current =
      existing.rows[0];

    const {
      exam,
      title,
      summary,
      official_link,
      published_date,
      expiry_date,
      is_important,
      is_published,
    } = req.body;

    const normalizedExam =
      exam !== undefined
        ? normalizeExam(exam)
        : current.exam;

    const cleanTitle =
      title !== undefined
        ? cleanText(title)
        : current.title;

    const cleanSummary =
      summary !== undefined
        ? cleanText(summary)
        : current.summary;

    const cleanOfficialLink =
      official_link !== undefined
        ? cleanText(
            official_link
          )
        : current.official_link;

    const finalPublishedDate =
      published_date !==
      undefined
        ? published_date
        : current.published_date;

    const finalExpiryDate =
      expiry_date !==
      undefined
        ? expiry_date
        : current.expiry_date;

    const important =
      is_important !==
      undefined
        ? is_important === true ||
          is_important === "true"
        : current.is_important;

    const published =
      is_published !==
      undefined
        ? is_published === true ||
          is_published === "true"
        : current.is_published;

    if (
      !VALID_EXAMS.includes(
        normalizedExam
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam must be either KCET or NEET.",
      });
    }

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message:
          "Notice title is required.",
      });
    }

    if (!cleanSummary) {
      return res.status(400).json({
        success: false,
        message:
          "Notice summary is required.",
      });
    }

    if (
      cleanTitle.length >
      255
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notice title must not exceed 255 characters.",
      });
    }

    if (
      finalPublishedDate &&
      !isValidDate(
        finalPublishedDate
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid published date.",
      });
    }

    if (
      finalExpiryDate &&
      !isValidDate(
        finalExpiryDate
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expiry date.",
      });
    }

    if (
      finalPublishedDate &&
      finalExpiryDate
    ) {
      const publishedDate =
        new Date(
          finalPublishedDate
        );

      const expiryDate =
        new Date(
          finalExpiryDate
        );

      if (
        expiryDate <
        publishedDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Expiry date cannot be before the published date.",
        });
      }
    }

    if (
      cleanOfficialLink &&
      !/^https?:\/\//i.test(
        cleanOfficialLink
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Official link must start with http:// or https://.",
      });
    }

    await client.query(
      "BEGIN"
    );

    const result =
      await client.query(
        `
        UPDATE notices
        SET
          exam = $1,
          title = $2,
          summary = $3,
          official_link = $4,
          published_date = $5::date,
          expiry_date = $6::date,
          is_important = $7,
          is_published = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
          AND created_by = $10
        RETURNING
          id,
          exam,
          title,
          summary,
          official_link,
          published_date,
          expiry_date,
          is_important,
          is_published,
          created_at,
          updated_at
        `,
        [
          normalizedExam,
          cleanTitle,
          cleanSummary,
          cleanOfficialLink ||
            null,
          finalPublishedDate ||
            null,
          finalExpiryDate ||
            null,
          important,
          published,
          noticeId,
          counsellor.id,
        ]
      );

    await client.query(
      "COMMIT"
    );

    return res.json({
      success: true,
      message:
        "Notice updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Update notice error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update notice.",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// DELETE NOTICE
// =====================================================
//
// DELETE /api/notices/:id
//
// =====================================================

const deleteNotice = async (
  req,
  res
) => {
  try {
    const noticeId =
      Number(req.params.id);

    if (
      !Number.isInteger(
        noticeId
      ) ||
      noticeId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notice ID.",
      });
    }

    const counsellor =
      await getCounsellorByUserId(
        req.user.user_id ||
          req.user.id
      );

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    if (
      !counsellor.is_verified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only verified counsellors can delete notices.",
      });
    }

    const result =
      await pool.query(
        `
        DELETE FROM notices
        WHERE id = $1
          AND created_by = $2
        RETURNING id
        `,
        [
          noticeId,
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
          "Notice not found or you are not authorized to delete it.",
      });
    }

    return res.json({
      success: true,
      message:
        "Notice deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete notice error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete notice.",
    });
  }
};

// =====================================================
// TOGGLE NOTICE PUBLISH STATUS
// =====================================================
//
// PATCH /api/notices/:id/publish
//
// =====================================================

const toggleNoticePublish =
  async (req, res) => {
    try {
      const noticeId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          noticeId
        ) ||
        noticeId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notice ID.",
        });
      }

      const counsellor =
        await getCounsellorByUserId(
          req.user.user_id ||
            req.user.id
        );

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      if (
        !counsellor.is_verified
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only verified counsellors can publish notices.",
        });
      }

      const existing =
        await pool.query(
          `
          SELECT
            id,
            is_published
          FROM notices
          WHERE id = $1
            AND created_by = $2
          `,
          [
            noticeId,
            counsellor.id,
          ]
        );

      if (
        existing.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Notice not found or you are not authorized to modify it.",
        });
      }

      const currentStatus =
        existing.rows[0]
          .is_published;

      const newStatus =
        !currentStatus;

      const result =
        await pool.query(
          `
          UPDATE notices
          SET
            is_published = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
            AND created_by = $3
          RETURNING
            id,
            exam,
            title,
            summary,
            official_link,
            published_date,
            expiry_date,
            is_important,
            is_published,
            created_at,
            updated_at
          `,
          [
            newStatus,
            noticeId,
            counsellor.id,
          ]
        );

      return res.json({
        success: true,
        message: newStatus
          ? "Notice published successfully."
          : "Notice unpublished successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Toggle notice publish error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notice publish status.",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getNotices,
  getAllNoticesForCounsellor,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticePublish,
};