const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

// =====================================================
// HELPERS
// =====================================================

const createToken = (user, counsellor) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.sign(
    {
      id: user.id,
      user_id: user.id,
      counsellor_id: counsellor.id,
      email: user.email,
      role: "counsellor",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const sanitizeCounsellor = (
  user,
  counsellor
) => {
  return {
    id: user.id,
    user_id: user.id,
    counsellor_id: counsellor.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: "counsellor",
    specialization:
      counsellor.specialization,
    experience_years:
      counsellor.experience_years,
    qualification:
      counsellor.qualification,
    bio: counsellor.bio,
    consultation_fee:
      counsellor.consultation_fee,
    is_verified:
      counsellor.is_verified,
    created_at:
      user.created_at,
  };
};

// =====================================================
// COUNSELLOR REGISTRATION
// =====================================================

const registerCounsellor =
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const {
        full_name,
        email,
        password,
        phone,
        specialization,
        experience_years,
        qualification,
        bio,
        consultation_fee,
      } = req.body;

      const cleanName =
        String(full_name || "").trim();

      const cleanEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      const cleanPhone =
        phone
          ? String(phone).trim()
          : null;

      const cleanSpecialization =
        String(
          specialization || ""
        ).trim();

      const cleanQualification =
        String(
          qualification || ""
        ).trim();

      const cleanBio =
        bio
          ? String(bio).trim()
          : null;

      const experience =
        Number(
          experience_years || 0
        );

      const fee =
        Number(
          consultation_fee || 0
        );

      // =================================================
      // VALIDATION
      // =================================================

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Full name is required.",
        });
      }

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Full name must contain at least 2 characters.",
        });
      }

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          cleanEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid email address.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required.",
        });
      }

      if (
        String(password).length <
        6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }

      if (!cleanSpecialization) {
        return res.status(400).json({
          success: false,
          message:
            "Specialization is required.",
        });
      }

      if (!cleanQualification) {
        return res.status(400).json({
          success: false,
          message:
            "Qualification is required.",
        });
      }

      if (
        !Number.isInteger(
          experience
        ) ||
        experience < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Experience must be a valid non-negative number.",
        });
      }

      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Consultation fee must be a valid non-negative amount.",
        });
      }

      // =================================================
      // CHECK EXISTING USER
      // =================================================

      const existingUser =
        await client.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [cleanEmail]
        );

      if (
        existingUser.rows.length >
        0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      // =================================================
      // HASH PASSWORD
      // =================================================

      const passwordHash =
        await bcrypt.hash(
          String(password),
          12
        );

      // =================================================
      // CREATE USER + COUNSELLOR
      // =================================================

      await client.query(
        "BEGIN"
      );

      const userResult =
        await client.query(
          `
          INSERT INTO users (
            full_name,
            email,
            password_hash,
            phone,
            role
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            'counsellor'
          )
          RETURNING
            id,
            full_name,
            email,
            phone,
            role,
            created_at
          `,
          [
            cleanName,
            cleanEmail,
            passwordHash,
            cleanPhone,
          ]
        );

      const user =
        userResult.rows[0];

      const counsellorResult =
        await client.query(
          `
          INSERT INTO counsellors (
            user_id,
            specialization,
            experience_years,
            qualification,
            bio,
            consultation_fee,
            is_verified
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            false
          )
          RETURNING
            id,
            user_id,
            specialization,
            experience_years,
            qualification,
            bio,
            consultation_fee,
            is_verified
          `,
          [
            user.id,
            cleanSpecialization,
            experience,
            cleanQualification,
            cleanBio,
            fee,
          ]
        );

      const counsellor =
        counsellorResult.rows[0];

      await client.query(
        "COMMIT"
      );

      return res.status(201).json({
        success: true,
        message:
          "Counsellor account created successfully. Your account is awaiting verification.",
        user:
          sanitizeCounsellor(
            user,
            counsellor
          ),
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch (
        rollbackError
      ) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }

      console.error(
        "Counsellor registration error:",
        error
      );

      if (
        error.code ===
        "23505"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create counsellor account.",
      });
    } finally {
      client.release();
    }
  };

// =====================================================
// COUNSELLOR LOGIN
// =====================================================

const loginCounsellor =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const cleanEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required.",
        });
      }

      // =================================================
      // FIND COUNSELLOR
      // =================================================

      const result =
        await pool.query(
          `
          SELECT
            u.id,
            u.full_name,
            u.email,
            u.password_hash,
            u.phone,
            u.role,
            u.created_at,

            c.id AS counsellor_id,
            c.specialization,
            c.experience_years,
            c.qualification,
            c.bio,
            c.consultation_fee,
            c.is_verified

          FROM users u

          JOIN counsellors c
            ON c.user_id = u.id

          WHERE LOWER(u.email) =
                LOWER($1)

            AND u.role =
                'counsellor'

          LIMIT 1
          `,
          [cleanEmail]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      const row =
        result.rows[0];

      // =================================================
      // VERIFY PASSWORD
      // =================================================

      const passwordMatch =
        await bcrypt.compare(
          String(password),
          row.password_hash
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      // =================================================
      // VERIFICATION CHECK
      // =================================================

      if (!row.is_verified) {
        return res.status(403).json({
          success: false,
          message:
            "Your counsellor account is awaiting verification. Please contact the administrator.",
          verification_pending:
            true,
        });
      }

      const user = {
        id: row.id,
        full_name:
          row.full_name,
        email: row.email,
        phone: row.phone,
        role: "counsellor",
        created_at:
          row.created_at,
      };

      const counsellor = {
        id: row.counsellor_id,
        user_id: row.id,
        specialization:
          row.specialization,
        experience_years:
          row.experience_years,
        qualification:
          row.qualification,
        bio: row.bio,
        consultation_fee:
          row.consultation_fee,
        is_verified:
          row.is_verified,
      };

      // =================================================
      // CREATE TOKEN
      // =================================================

      const token =
        createToken(
          user,
          counsellor
        );

      return res.json({
        success: true,
        message:
          "Counsellor login successful.",
        token,
        user:
          sanitizeCounsellor(
            user,
            counsellor
          ),
      });
    } catch (error) {
      console.error(
        "Counsellor login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to login. Please try again.",
      });
    }
  };

// =====================================================
// GET COUNSELLOR CURRENT USER
// =====================================================

const getCurrentCounsellor =
  async (req, res) => {
    try {
      const userId =
        Number(
          req.user?.user_id ||
            req.user?.id
        );

      if (
        !Number.isInteger(
          userId
        ) ||
        userId <= 0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            u.id,
            u.full_name,
            u.email,
            u.phone,
            u.role,
            u.created_at,

            c.id AS counsellor_id,
            c.specialization,
            c.experience_years,
            c.qualification,
            c.bio,
            c.consultation_fee,
            c.is_verified

          FROM users u

          JOIN counsellors c
            ON c.user_id = u.id

          WHERE u.id = $1
            AND u.role =
                'counsellor'

          LIMIT 1
          `,
          [userId]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Counsellor account not found.",
        });
      }

      const row =
        result.rows[0];

      return res.json({
        success: true,
        user: {
          id: row.id,
          user_id: row.id,
          counsellor_id:
            row.counsellor_id,
          full_name:
            row.full_name,
          email: row.email,
          phone: row.phone,
          role: "counsellor",
          specialization:
            row.specialization,
          experience_years:
            row.experience_years,
          qualification:
            row.qualification,
          bio: row.bio,
          consultation_fee:
            row.consultation_fee,
          is_verified:
            row.is_verified,
          created_at:
            row.created_at,
        },
      });
    } catch (error) {
      console.error(
        "Get current counsellor error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch counsellor account.",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  registerCounsellor,
  loginCounsellor,
  getCurrentCounsellor,
};