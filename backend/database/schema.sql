-- =========================================================
-- GET YOUR SEAT
-- Database Schema
-- PostgreSQL
-- =========================================================

-- =========================================================
-- 1. USERS
-- =========================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    phone VARCHAR(20),

    role VARCHAR(20) NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'counsellor', 'admin')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. STUDENTS
-- =========================================================

CREATE TABLE students (
    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE NOT NULL,

    date_of_birth DATE,

    gender VARCHAR(20),

    city VARCHAR(100),

    state VARCHAR(100),

    preferred_course VARCHAR(150),

    preferred_location VARCHAR(150),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 3. EXAMS
-- =========================================================

CREATE TABLE exams (
    id SERIAL PRIMARY KEY,

    name VARCHAR(50) UNIQUE NOT NULL,

    full_name VARCHAR(200),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 4. STUDENT EXAM RESULTS
-- =========================================================

CREATE TABLE student_exam_results (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    exam_id INTEGER NOT NULL,

    exam_year INTEGER NOT NULL,

    score DECIMAL(10,2),

    rank INTEGER,

    percentile DECIMAL(6,3),

    category VARCHAR(50),

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (exam_id)
        REFERENCES exams(id)
        ON DELETE CASCADE,

    UNIQUE(student_id, exam_id, exam_year),

    CHECK (score IS NULL OR score >= 0),

    CHECK (rank IS NULL OR rank > 0),

    CHECK (
        percentile IS NULL
        OR (percentile >= 0 AND percentile <= 100)
    )
);


-- =========================================================
-- 5. COLLEGES
-- =========================================================

CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,

    name VARCHAR(200) NOT NULL,

    short_name VARCHAR(100),

    city VARCHAR(100),

    state VARCHAR(100),

    college_type VARCHAR(50),

    website VARCHAR(300),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 6. COURSES
-- =========================================================

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,

    name VARCHAR(200) NOT NULL,

    degree VARCHAR(100),

    duration_years DECIMAL(3,1),

    description TEXT
);


-- =========================================================
-- 7. BRANCHES
-- =========================================================

CREATE TABLE branches (
    id SERIAL PRIMARY KEY,

    name VARCHAR(200) NOT NULL,

    code VARCHAR(50),

    description TEXT
);


-- =========================================================
-- 8. COLLEGE COURSES
-- =========================================================

CREATE TABLE college_courses (
    id SERIAL PRIMARY KEY,

    college_id INTEGER NOT NULL,

    course_id INTEGER NOT NULL,

    branch_id INTEGER,

    total_seats INTEGER,

    FOREIGN KEY (college_id)
        REFERENCES colleges(id)
        ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE SET NULL,

    UNIQUE(college_id, course_id, branch_id),

    CHECK (
        total_seats IS NULL
        OR total_seats > 0
    )
);


-- =========================================================
-- 9. CUTOFFS
-- =========================================================

CREATE TABLE cutoffs (
    id SERIAL PRIMARY KEY,

    college_course_id INTEGER NOT NULL,

    exam_id INTEGER NOT NULL,

    year INTEGER NOT NULL,

    category VARCHAR(50),

    quota VARCHAR(100),

    opening_rank INTEGER,

    closing_rank INTEGER,

    FOREIGN KEY (college_course_id)
        REFERENCES college_courses(id)
        ON DELETE CASCADE,

    FOREIGN KEY (exam_id)
        REFERENCES exams(id)
        ON DELETE CASCADE,

    CHECK (
        opening_rank IS NULL
        OR opening_rank > 0
    ),

    CHECK (
        closing_rank IS NULL
        OR closing_rank > 0
    ),

    CHECK (
        opening_rank IS NULL
        OR closing_rank IS NULL
        OR opening_rank <= closing_rank
    )
);


-- =========================================================
-- 10. COUNSELLORS
-- =========================================================

CREATE TABLE counsellors (
    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE NOT NULL,

    specialization VARCHAR(200),

    experience_years INTEGER DEFAULT 0,

    qualification VARCHAR(200),

    bio TEXT,

    consultation_fee DECIMAL(10,2),

    is_verified BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CHECK (experience_years >= 0),

    CHECK (
        consultation_fee IS NULL
        OR consultation_fee >= 0
    )
);


-- =========================================================
-- 11. APPOINTMENTS
-- =========================================================

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    counsellor_id INTEGER NOT NULL,

    appointment_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    status VARCHAR(30) DEFAULT 'scheduled'
        CHECK (
            status IN (
                'scheduled',
                'completed',
                'cancelled',
                'rescheduled'
            )
        ),

    meeting_link TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (counsellor_id)
        REFERENCES counsellors(id)
        ON DELETE CASCADE,

    CHECK (end_time > start_time)
);


-- =========================================================
-- 12. REVIEWS
-- =========================================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    counsellor_id INTEGER NOT NULL,

    rating INTEGER NOT NULL,

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (counsellor_id)
        REFERENCES counsellors(id)
        ON DELETE CASCADE,

    CHECK (rating BETWEEN 1 AND 5)
);


-- =========================================================
-- 13. DOCUMENTS
-- =========================================================

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    document_type VARCHAR(100) NOT NULL,

    file_name VARCHAR(255),

    file_url TEXT,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 14. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_students_user_id
ON students(user_id);

CREATE INDEX idx_exam_results_student
ON student_exam_results(student_id);

CREATE INDEX idx_exam_results_exam
ON student_exam_results(exam_id);

CREATE INDEX idx_colleges_state
ON colleges(state);

CREATE INDEX idx_colleges_city
ON colleges(city);

CREATE INDEX idx_college_courses_college
ON college_courses(college_id);

CREATE INDEX idx_college_courses_course
ON college_courses(course_id);

CREATE INDEX idx_cutoffs_exam
ON cutoffs(exam_id);

CREATE INDEX idx_cutoffs_year
ON cutoffs(year);

CREATE INDEX idx_cutoffs_closing_rank
ON cutoffs(closing_rank);

CREATE INDEX idx_appointments_student
ON appointments(student_id);

CREATE INDEX idx_appointments_counsellor
ON appointments(counsellor_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id);