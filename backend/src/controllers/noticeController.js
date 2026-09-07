const pool = require("../config/database");

// =====================================================
// GET ALL PUBLISHED NOTICES
// =====================================================

const getNotices = async (req, res) => {
  try {
    const { exam } = req.query;

    let query = `
      SELECT
        n.id,
        n.exam,
        n.title,
        n.summary,
        n.official_link,
        n.published_date,
        n.expiry_date,
        n.is_important,
        n.is_published,
        n.created_at,
        n.updated_at,
        c.id AS counsellor_id,
        u.full_name AS counsellor_name
      FROM notices n
      JOIN counsellors c
        ON n.created_by = c.id
      JOIN users u
        ON c.user_id = u.id
      WHERE n.is_published = true
        AND (
          n.expiry_date IS NULL
          OR n.expiry_date >= CURRENT_DATE
        )
    `;

    const values = [];

    if (exam) {
      const normalizedExam =
        exam.toUpperCase();

      if (
        !["KCET", "NEET"].includes(
          normalizedExam
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exam must be either KCET or NEET.",
        });
      }

      values.push(normalizedExam);

      query += `
        AND n.exam = $1
      `;
    }

    query += `
      ORDER BY
        n.is_important DESC,
        n.published_date DESC,
        n.created_at DESC
    `;

    const result =
      await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get notices error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch notices.",
    });
  }
};

// =====================================================
// GET ALL NOTICES FOR COUNSELLOR MANAGEMENT
// =====================================================

const getAllNoticesForCounsellor =
  async (req, res) => {
    try {
      const counsellorResult =
        await pool.query(
          `
          SELECT id
          FROM counsellors
          WHERE user_id = $1
          `,
          [req.user.id]
        );

      if (
        counsellorResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      const result =
        await pool.query(`
        SELECT
          n.id,
          n.exam,
          n.title,
          n.summary,
          n.official_link,
          n.published_date,
          n.expiry_date,
          n.is_important,
          n.is_published,
          n.created_at,
          n.updated_at,
          c.id AS counsellor_id,
          u.full_name AS counsellor_name
        FROM notices n
        JOIN counsellors c
          ON n.created_by = c.id
        JOIN users u
          ON c.user_id = u.id
        ORDER BY
          n.is_published DESC,
          n.is_important DESC,
          n.published_date DESC,
          n.created_at DESC
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Get counsellor notices error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch notices.",
      });
    }
  };

// =====================================================
// CREATE NOTICE
// =====================================================

const createNotice = async (req, res) => {
  try {
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

    if (
      !exam ||
      !title ||
      !summary
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam, title and summary are required.",
      });
    }

    const normalizedExam =
      exam.toUpperCase();

    if (
      !["KCET", "NEET"].includes(
        normalizedExam
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam must be either KCET or NEET.",
      });
    }

    if (
      expiry_date &&
      published_date &&
      expiry_date < published_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date cannot be before published date.",
      });
    }

    const counsellorResult =
      await pool.query(
        `
        SELECT id
        FROM counsellors
        WHERE user_id = $1
        `,
        [req.user.id]
      );

    if (
      counsellorResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    const result =
      await pool.query(
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
          COALESCE($5, CURRENT_DATE),
          $6,
          COALESCE($7, false),
          COALESCE($8, true),
          $9
        )
        RETURNING *
        `,
        [
          normalizedExam,
          title.trim(),
          summary.trim(),
          official_link || null,
          published_date || null,
          expiry_date || null,
          is_important ?? false,
          is_published ?? true,
          counsellorId,
        ]
      );

    res.status(201).json({
      success: true,
      message:
        "Notice created successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create notice.",
    });
  }
};

// =====================================================
// UPDATE NOTICE
// =====================================================

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;

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

    if (
      !exam ||
      !title ||
      !summary
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam, title and summary are required.",
      });
    }

    const normalizedExam =
      exam.toUpperCase();

    if (
      !["KCET", "NEET"].includes(
        normalizedExam
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam must be either KCET or NEET.",
      });
    }

    if (
      expiry_date &&
      published_date &&
      expiry_date < published_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date cannot be before published date.",
      });
    }

    const counsellorResult =
      await pool.query(
        `
        SELECT id
        FROM counsellors
        WHERE user_id = $1
        `,
        [req.user.id]
      );

    if (
      counsellorResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    const existingResult =
      await pool.query(
        `
        SELECT id
        FROM notices
        WHERE id = $1
          AND created_by = $2
        `,
        [id, counsellorId]
      );

    if (
      existingResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Notice not found or you are not allowed to edit it.",
      });
    }

    const result =
      await pool.query(
        `
        UPDATE notices
        SET
          exam = $1,
          title = $2,
          summary = $3,
          official_link = $4,
          published_date = COALESCE($5, published_date),
          expiry_date = $6,
          is_important = COALESCE($7, false),
          is_published = COALESCE($8, true),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
          AND created_by = $10
        RETURNING *
        `,
        [
          normalizedExam,
          title.trim(),
          summary.trim(),
          official_link || null,
          published_date || null,
          expiry_date || null,
          is_important ?? false,
          is_published ?? true,
          id,
          counsellorId,
        ]
      );

    res.json({
      success: true,
      message:
        "Notice updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update notice.",
    });
  }
};

// =====================================================
// DELETE NOTICE
// =====================================================

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const counsellorResult =
      await pool.query(
        `
        SELECT id
        FROM counsellors
        WHERE user_id = $1
        `,
        [req.user.id]
      );

    if (
      counsellorResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Counsellor profile not found.",
      });
    }

    const counsellorId =
      counsellorResult.rows[0].id;

    const result =
      await pool.query(
        `
        DELETE FROM notices
        WHERE id = $1
          AND created_by = $2
        RETURNING id
        `,
        [id, counsellorId]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notice not found or you are not allowed to delete it.",
      });
    }

    res.json({
      success: true,
      message:
        "Notice deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete notice.",
    });
  }
};

// =====================================================
// TOGGLE PUBLISH STATUS
// =====================================================

const toggleNoticePublish =
  async (req, res) => {
    try {
      const { id } = req.params;

      const counsellorResult =
        await pool.query(
          `
          SELECT id
          FROM counsellors
          WHERE user_id = $1
          `,
          [req.user.id]
        );

      if (
        counsellorResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor profile not found.",
        });
      }

      const counsellorId =
        counsellorResult.rows[0].id;

      const result =
        await pool.query(
          `
          UPDATE notices
          SET
            is_published =
              NOT is_published,
            updated_at =
              CURRENT_TIMESTAMP
          WHERE id = $1
            AND created_by = $2
          RETURNING *
          `,
          [id, counsellorId]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Notice not found or you are not allowed to modify it.",
        });
      }

      res.json({
        success: true,
        message:
          result.rows[0].is_published
            ? "Notice published successfully."
            : "Notice unpublished successfully.",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Toggle notice publish error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notice status.",
      });
    }
  };

module.exports = {
  getNotices,
  getAllNoticesForCounsellor,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticePublish,
};