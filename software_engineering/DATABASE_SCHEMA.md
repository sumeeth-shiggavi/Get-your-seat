# NEET, KCET & JEE Counselling Platform

# Database Design Document

**Version:** 1.0  
**Database:** PostgreSQL  
**Project Type:** Web-Based Counselling and College Guidance Platform  
**Frontend:** React.js + JavaScript  
**Backend:** Node.js + Express.js  

---

## 1. Introduction

The NEET, KCET & JEE Counselling Platform requires a structured database to store and manage information related to students, examinations, colleges, courses, cutoffs, counsellors, appointments, payments, documents, reviews, and notifications.

The database is designed using **PostgreSQL** and follows a relational database model.

The primary goals of the database are:

- Maintain accurate student information.
- Store examination results.
- Manage college and course information.
- Store historical counselling cutoff data.
- Support the college prediction system.
- Manage counsellor information.
- Manage counselling appointments.
- Track payments.
- Store student documents.
- Manage reviews and notifications.
- Maintain data integrity through primary keys, foreign keys, constraints, and indexes.

---

# 2. Database Technology

| Property | Technology |
|---|---|
| Database Management System | PostgreSQL |
| Database Model | Relational |
| Query Language | SQL |
| Backend | Node.js + Express.js |
| Frontend | React.js + JavaScript |
| API Architecture | REST API |

---

# 3. Database Architecture

The major database entities are:

```text
USER
STUDENT
COUNSELLOR
EXAM
STUDENT_EXAM_RESULT
COLLEGE
COURSE
BRANCH
COLLEGE_COURSE
CUTOFF
APPOINTMENT
PAYMENT
REVIEW
DOCUMENT
NOTIFICATION
```

High-level relationship:

```text
                         USER
                          |
             +------------+------------+
             |                         |
             v                         v
         STUDENT                  COUNSELLOR
             |                         |
             v                         |
      EXAM RESULTS                     |
             |                         |
             v                         |
           EXAM                        |
                                       |
             +-------------------------+
             |
             v
        APPOINTMENT
             |
       +-----+------+
       |            |
       v            v
    PAYMENT       REVIEW


       COLLEGE
          |
          v
   COLLEGE_COURSE
       /       \
      v         v
   COURSE     CUTOFF
      |
      v
   BRANCH

STUDENT
   |
   +----> DOCUMENT
   |
   +----> NOTIFICATION
```

---

# 4. Entity Description

## 4.1 Users

Stores authentication and basic information for all users.

Users can have one of three roles:

- STUDENT
- COUNSELLOR
- ADMIN

---

## 4.2 Students

Stores additional information specific to students.

---

## 4.3 Counsellors

Stores professional information about counselling providers.

---

## 4.4 Exams

Stores supported entrance examinations.

Initial exams:

- NEET UG
- KCET
- JEE Main
- JEE Advanced

---

## 4.5 Student Exam Results

Stores examination results associated with students.

A student can have multiple examination results.

---

## 4.6 Colleges

Stores college information.

---

## 4.7 Courses

Stores academic courses such as:

- Engineering
- MBBS
- BDS

---

## 4.8 Branches

Stores specializations within courses.

For example:

```text
Engineering
├── Computer Science & Engineering
├── Electronics & Communication
├── Mechanical Engineering
├── Civil Engineering
└── Electrical Engineering
```

---

## 4.9 College Courses

Acts as a junction table between colleges and courses.

It stores information such as:

- Fees
- Duration
- Intake
- Branch

---

## 4.10 Cutoffs

Stores historical admission cutoff information.

This table is particularly important for the **College Predictor**.

---

## 4.11 Appointments

Stores counselling appointments between students and counsellors.

---

## 4.12 Payments

Stores payment transactions associated with counselling appointments.

---

## 4.13 Reviews

Stores student reviews and ratings for counsellors.

---

## 4.14 Documents

Stores references to student-uploaded documents.

The actual files should be stored in secure file storage rather than directly inside PostgreSQL.

---

## 4.15 Notifications

Stores notifications sent to users.

---

# 5. Detailed Table Design

# 5.1 USERS

### Purpose

Stores authentication and common user information.

### Table

```text
users
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Unique user ID |
| name | VARCHAR(100) | NOT NULL | User name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Email address |
| phone | VARCHAR(15) | UNIQUE | Phone number |
| password_hash | TEXT | NOT NULL | Hashed password |
| role | VARCHAR(20) | NOT NULL | User role |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | DEFAULT | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT | Last update timestamp |

### Role values

```text
STUDENT
COUNSELLOR
ADMIN
```

---

# 5.2 STUDENTS

### Purpose

Stores student-specific information.

### Table

```text
students
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Student ID |
| user_id | INTEGER | FK, UNIQUE | Related user |
| date_of_birth | DATE | | Date of birth |
| gender | VARCHAR(20) | | Gender |
| state | VARCHAR(100) | | State |
| city | VARCHAR(100) | | City |
| category | VARCHAR(50) | | Admission category |
| created_at | TIMESTAMP | DEFAULT | Creation time |
| updated_at | TIMESTAMP | DEFAULT | Last update |

### Relationship

```text
USER 1 ───────── 1 STUDENT
```

---

# 5.3 COUNSELLORS

### Purpose

Stores counsellor information.

### Table

```text
counsellors
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Counsellor ID |
| user_id | INTEGER | FK, UNIQUE | Related user |
| qualification | VARCHAR(200) | | Qualification |
| experience | INTEGER | DEFAULT 0 | Years of experience |
| specialization | TEXT | | Area of specialization |
| bio | TEXT | | Counsellor biography |
| session_fee | DECIMAL(10,2) | DEFAULT 0 | Session fee |
| verification_status | VARCHAR(20) | | Verification state |
| rating | DECIMAL(2,1) | DEFAULT 0 | Average rating |
| created_at | TIMESTAMP | DEFAULT | Creation time |
| updated_at | TIMESTAMP | DEFAULT | Last update |

### Verification status

```text
PENDING
VERIFIED
REJECTED
```

### Relationship

```text
USER 1 ───────── 1 COUNSELLOR
```

---

# 5.4 EXAMS

### Purpose

Stores supported entrance examinations.

### Table

```text
exams
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Exam ID |
| name | VARCHAR(100) | NOT NULL | Exam name |
| code | VARCHAR(30) | UNIQUE | Exam code |
| description | TEXT | | Description |
| created_at | TIMESTAMP | DEFAULT | Creation time |

### Initial data

| Name | Code |
|---|---|
| NEET UG | NEET |
| Karnataka CET | KCET |
| JEE Main | JEE_MAIN |
| JEE Advanced | JEE_ADV |

---

# 5.5 STUDENT_EXAM_RESULTS

### Purpose

Stores examination results of students.

### Table

```text
student_exam_results
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Result ID |
| student_id | INTEGER | FK | Student |
| exam_id | INTEGER | FK | Examination |
| year | INTEGER | NOT NULL | Exam year |
| rank | INTEGER | | Rank |
| score | DECIMAL(10,2) | | Score |
| percentile | DECIMAL(6,3) | | Percentile |
| created_at | TIMESTAMP | DEFAULT | Creation time |

### Relationship

```text
STUDENT 1 ───── M STUDENT_EXAM_RESULTS M ───── 1 EXAM
```

### Example

```text
Student: Rahul

KCET 2026
Rank: 4532

JEE Main 2026
Rank: 18000
```

---

# 5.6 COLLEGES

### Purpose

Stores college information.

### Table

```text
colleges
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | College ID |
| name | VARCHAR(200) | NOT NULL | College name |
| code | VARCHAR(50) | UNIQUE | College code |
| state | VARCHAR(100) | | State |
| city | VARCHAR(100) | | City |
| address | TEXT | | Address |
| college_type | VARCHAR(50) | | Government/Private/etc. |
| description | TEXT | | College description |
| website | VARCHAR(300) | | Official website |
| logo_url | TEXT | | Logo location |
| created_at | TIMESTAMP | DEFAULT | Creation time |
| updated_at | TIMESTAMP | DEFAULT | Last update |

---

# 5.7 COURSES

### Purpose

Stores academic courses.

### Table

```text
courses
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Course ID |
| name | VARCHAR(150) | NOT NULL | Course name |
| code | VARCHAR(50) | UNIQUE | Course code |
| description | TEXT | | Description |
| created_at | TIMESTAMP | DEFAULT | Creation time |

### Examples

```text
Engineering
MBBS
BDS
```

---

# 5.8 BRANCHES

### Purpose

Stores branches/specializations within courses.

### Table

```text
branches
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Branch ID |
| course_id | INTEGER | FK | Related course |
| name | VARCHAR(150) | NOT NULL | Branch name |
| code | VARCHAR(50) | | Branch code |

### Relationship

```text
COURSE 1 ───────── M BRANCH
```

---

# 5.9 COLLEGE_COURSES

### Purpose

Connects colleges with courses and branches.

This table resolves the many-to-many relationship between colleges and courses.

### Table

```text
college_courses
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Record ID |
| college_id | INTEGER | FK | College |
| course_id | INTEGER | FK | Course |
| branch_id | INTEGER | FK | Branch |
| duration_years | DECIMAL(3,1) | | Course duration |
| fees | DECIMAL(12,2) | | Fees |
| intake | INTEGER | | Annual intake |

### Relationship

```text
COLLEGE 1 ───── M COLLEGE_COURSES M ───── 1 COURSE
```

---

# 5.10 CUTOFFS

### Purpose

Stores historical cutoff information used by the college prediction system.

### Table

```text
cutoffs
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Cutoff ID |
| exam_id | INTEGER | FK | Examination |
| college_course_id | INTEGER | FK | College/course combination |
| year | INTEGER | NOT NULL | Admission year |
| category | VARCHAR(50) | NOT NULL | Category |
| round | INTEGER | | Counselling round |
| opening_rank | INTEGER | | Opening rank |
| closing_rank | INTEGER | | Closing rank |

### Example

```text
Exam: KCET
Year: 2025
College: College A
Branch: CSE
Category: 2A
Opening Rank: 100
Closing Rank: 5200
```

### Important role

```text
Student Rank
      ↓
Historical Cutoffs
      ↓
Prediction Engine
      ↓
College Prediction
```

---

# 5.11 APPOINTMENTS

### Purpose

Stores counselling appointments.

### Table

```text
appointments
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Appointment ID |
| student_id | INTEGER | FK | Student |
| counsellor_id | INTEGER | FK | Counsellor |
| appointment_date | DATE | NOT NULL | Appointment date |
| start_time | TIME | NOT NULL | Start time |
| end_time | TIME | NOT NULL | End time |
| status | VARCHAR(20) | | Appointment status |
| meeting_link | TEXT | | Online meeting link |
| created_at | TIMESTAMP | DEFAULT | Creation time |

### Status

```text
PENDING
CONFIRMED
COMPLETED
CANCELLED
```

### Relationship

```text
STUDENT 1 ───── M APPOINTMENTS M ───── 1 COUNSELLOR
```

---

# 5.12 PAYMENTS

### Purpose

Stores payment information associated with counselling appointments.

### Table

```text
payments
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Payment ID |
| appointment_id | INTEGER | FK, UNIQUE | Appointment |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_gateway | VARCHAR(50) | | Gateway |
| transaction_id | VARCHAR(200) | UNIQUE | Transaction ID |
| status | VARCHAR(20) | | Payment status |
| paid_at | TIMESTAMP | | Payment time |
| created_at | TIMESTAMP | DEFAULT | Creation time |

### Status

```text
PENDING
SUCCESS
FAILED
REFUNDED
```

### Relationship

```text
APPOINTMENT 1 ───── 1 PAYMENT
```

---

# 5.13 REVIEWS

### Purpose

Stores reviews submitted by students after counselling.

### Table

```text
reviews
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Review ID |
| student_id | INTEGER | FK | Student |
| counsellor_id | INTEGER | FK | Counsellor |
| appointment_id | INTEGER | FK, UNIQUE | Appointment |
| rating | INTEGER | 1–5 | Rating |
| comment | TEXT | | Review |
| created_at | TIMESTAMP | DEFAULT | Creation time |

### Relationship

```text
STUDENT ─────── REVIEW ─────── COUNSELLOR
                     |
                     |
                APPOINTMENT
```

---

# 5.14 DOCUMENTS

### Purpose

Stores references to student documents.

### Table

```text
documents
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Document ID |
| student_id | INTEGER | FK | Student |
| document_type | VARCHAR(100) | NOT NULL | Type of document |
| file_url | TEXT | NOT NULL | Secure file location |
| verification_status | VARCHAR(20) | | Verification state |
| uploaded_at | TIMESTAMP | DEFAULT | Upload time |

### Document examples

```text
Rank Card
Marks Card
Category Certificate
Domicile Certificate
Identity Proof
```

---

# 5.15 NOTIFICATIONS

### Purpose

Stores system notifications for users.

### Table

```text
notifications
```

### Columns

| Column | Data Type | Constraint | Description |
|---|---|---|---|
| id | SERIAL | PK | Notification ID |
| user_id | INTEGER | FK | Recipient |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification content |
| type | VARCHAR(50) | | Notification type |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT | Creation time |

---

# 6. Primary Keys

Every major entity has a unique primary key.

```text
users.id
students.id
counsellors.id
exams.id
student_exam_results.id
colleges.id
courses.id
branches.id
college_courses.id
cutoffs.id
appointments.id
payments.id
reviews.id
documents.id
notifications.id
```

Primary keys uniquely identify each record.

---

# 7. Foreign Keys

Important foreign-key relationships include:

```text
students.user_id
        ↓
users.id
```

```text
counsellors.user_id
        ↓
users.id
```

```text
student_exam_results.student_id
        ↓
students.id
```

```text
student_exam_results.exam_id
        ↓
exams.id
```

```text
branches.course_id
        ↓
courses.id
```

```text
college_courses.college_id
        ↓
colleges.id
```

```text
college_courses.course_id
        ↓
courses.id
```

```text
cutoffs.exam_id
        ↓
exams.id
```

```text
appointments.student_id
        ↓
students.id
```

```text
appointments.counsellor_id
        ↓
counsellors.id
```

---

# 8. Cardinality

| Relationship | Cardinality |
|---|---|
| User → Student | 1 : 1 |
| User → Counsellor | 1 : 1 |
| Student → Exam Results | 1 : M |
| Exam → Exam Results | 1 : M |
| Course → Branch | 1 : M |
| College → College Courses | 1 : M |
| Course → College Courses | 1 : M |
| Exam → Cutoffs | 1 : M |
| College Course → Cutoffs | 1 : M |
| Student → Appointments | 1 : M |
| Counsellor → Appointments | 1 : M |
| Appointment → Payment | 1 : 1 |
| Student → Documents | 1 : M |
| Student → Notifications | 1 : M |
| Student → Reviews | 1 : M |
| Counsellor → Reviews | 1 : M |

---

# 9. Database Constraints

The database will use constraints to maintain data integrity.

### NOT NULL

Used for required fields.

Example:

```sql
name VARCHAR(100) NOT NULL
```

### UNIQUE

Used where duplicate values should not exist.

Example:

```sql
email VARCHAR(150) UNIQUE
```

### CHECK

Used to restrict values.

Example:

```sql
rating INTEGER CHECK (rating BETWEEN 1 AND 5)
```

### FOREIGN KEY

Maintains relationships between tables.

### ON DELETE CASCADE

Used where child data should automatically be removed when its parent is deleted.

---

# 10. Database Indexes

Indexes improve query performance.

Important indexes:

```sql
CREATE INDEX idx_colleges_state
ON colleges(state);

CREATE INDEX idx_colleges_city
ON colleges(city);

CREATE INDEX idx_cutoffs_exam
ON cutoffs(exam_id);

CREATE INDEX idx_cutoffs_year
ON cutoffs(year);

CREATE INDEX idx_cutoffs_category
ON cutoffs(category);

CREATE INDEX idx_cutoffs_closing_rank
ON cutoffs(closing_rank);

CREATE INDEX idx_appointments_student
ON appointments(student_id);

CREATE INDEX idx_appointments_counsellor
ON appointments(counsellor_id);
```

These indexes will be particularly useful for:

- College searches
- Cutoff searches
- College prediction
- Appointment history

---

# 11. College Predictor Data Flow

The database is designed to support the prediction engine.

```text
                STUDENT
                   |
                   v
           EXAM RESULT
                   |
                   v
          Student Rank/Score
                   |
                   v
          PREDICTION ENGINE
                   |
          +--------+--------+
          |                 |
          v                 v
       COLLEGE          CUTOFF DATA
                           |
                           v
                    Historical Data
                           |
                           v
                    Prediction Result
```

Example:

```text
Student Rank = 4532
Exam = KCET
Category = 2A
Branch = CSE

                ↓

Historical Cutoff Data

                ↓

College A → Closing Rank 5200
College B → Closing Rank 4300
College C → Closing Rank 7000

                ↓

Prediction

College A → High
College B → Moderate/Low
College C → High
```

The prediction results are **estimates based on historical data** and should not be presented as guaranteed admission outcomes.

---

# 12. Appointment Data Flow

```text
Student
   |
   v
Select Counsellor
   |
   v
Check Availability
   |
   v
Select Date & Time
   |
   v
Create Appointment
   |
   v
Payment
   |
   v
Payment Verification
   |
   v
Confirm Appointment
   |
   v
Generate Meeting Link
```

---

# 13. Security Considerations

The database contains user and student information, so security is important.

The application should:

- Never store plain-text passwords.
- Store passwords as secure hashes.
- Use parameterized SQL queries.
- Validate user input.
- Use role-based authorization.
- Restrict administrative operations.
- Protect database credentials using environment variables.
- Encrypt communication using HTTPS.
- Secure uploaded documents.
- Avoid storing unnecessary sensitive information.
- Keep payment information handled by the payment gateway where possible.

---

# 14. Backup and Recovery

The production database should have:

- Regular automated backups.
- Point-in-time recovery where appropriate.
- Backup retention policy.
- Disaster recovery procedure.
- Database monitoring.

During the initial development phase, local backups can be sufficient.

---

# 15. Future Database Expansion

The database can later be extended with:

```text
COLLEGE_REVIEWS
COLLEGE_FACILITIES
HOSTELS
PLACEMENTS
SCHOLARSHIPS
CHOICE_LISTS
CHOICE_LIST_ITEMS
COUNSELLING_ROUNDS
APPLICATIONS
AI_RECOMMENDATIONS
CHAT_MESSAGES
VIDEO_SESSIONS
AUDIT_LOGS
```

These should be added only when the corresponding functionality is actually introduced.

---

# 16. Final Database Structure

```text
                            ┌─────────────┐
                            │    USERS    │
                            └──────┬──────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
               ┌──────────┐               ┌────────────┐
               │ STUDENTS │               │COUNSELLORS │
               └────┬─────┘               └─────┬──────┘
                    │                            │
                    │                            │
                    ▼                            │
           ┌─────────────────┐                   │
           │ EXAM RESULTS    │                   │
           └────────┬────────┘                   │
                    │                            │
                    ▼                            │
               ┌─────────┐                       │
               │  EXAMS  │                       │
               └─────────┘                       │
                                                 │
                    ┌────────────────────────────┘
                    ▼
             ┌──────────────┐
             │ APPOINTMENTS │
             └──────┬───────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
        ┌─────────┐    ┌─────────┐
        │ PAYMENT │    │ REVIEW  │
        └─────────┘    └─────────┘


          ┌─────────────┐
          │   COLLEGES  │
          └──────┬──────┘
                 │
                 ▼
        ┌──────────────────┐
        │ COLLEGE_COURSES  │
        └───────┬──────────┘
                │
          ┌─────┴─────┐
          ▼           ▼
      ┌────────┐   ┌────────┐
      │ COURSE │   │ CUTOFF │
      └───┬────┘   └───▲────┘
          │             │
          ▼             │
      ┌────────┐        │
      │ BRANCH │        │
      └────────┘        │
                        │
                       EXAM


       STUDENTS
          │
     ┌────┴────┐
     ▼         ▼
 DOCUMENTS  NOTIFICATIONS
```

---

# 17. Conclusion

The PostgreSQL database for the NEET, KCET & JEE Counselling Platform is designed to provide a reliable foundation for the complete application.

The design separates:

- Authentication data
- Student information
- Examination results
- College information
- Course and branch information
- Historical cutoff information
- Counselling information
- Payment information
- Documents
- Reviews
- Notifications

The design also supports future expansion such as AI-based recommendations, advanced college prediction, online chat, video counselling, and choice-filling assistance.

The database will be integrated with the **Node.js + Express backend through REST APIs**.

---

## Next Database Implementation Stage

The next technical step will be to create:

```text
database/
│
├── schema.sql
├── seed.sql
└── README.md
```

`schema.sql` will contain the table definitions, constraints, indexes, and relationships.

`seed.sql` will contain initial development data for:

- Exams
- Courses
- Branches
- Sample colleges
- Sample cutoff records
- Development users

This will allow us to connect PostgreSQL to the Node.js backend and begin actual development.