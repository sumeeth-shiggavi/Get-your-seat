### UC-01: Student Registration



Actor: Student

Goal: Create an account on the platform.

Preconditions

Student does not already have an account.

Student has a valid email/phone number.

Main Flow

1\. Student opens platform

&#x20;       ↓

2\. Clicks "Register"

&#x20;       ↓

3\. Enters name, email/phone, password

&#x20;       ↓

4\. System validates information

&#x20;       ↓

5\. OTP/email verification

&#x20;       ↓

6\. Account created

&#x20;       ↓

7\. Student redirected to profile

Alternative Flow



If the email/phone already exists:



Account already exists

&#x20;       ↓

"Please Login"

Postcondition



A new student account exists in the system.



### UC-02: Student Login



Actor: Student

FloW

Enter Email/Phone + Password

&#x20;            ↓

&#x20;      Validate details

&#x20;            ↓

&#x20;       Credentials?

&#x20;       /          \\

&#x20;     Yes           No

&#x20;      ↓             ↓

&#x20;  Dashboard     Error message



### UC-03: Manage Student Profile



Actor: Student

The student enters:

Personal Information

&#x20;       +

Exam Information

&#x20;       +

Preferences



Example:



Name: Rahul

State: Karnataka



Exam: KCET

Rank: 4532

Category: 2A



Preferred Course: Engineering

Preferred Branch: CSE

Preferred Location: Bengaluru

Budget: ₹2,00,000



The system stores this information for later use by the college predictor and counselling system.



### UC-04: College Search



Actor: Student



Flow

Student

&#x20;  ↓

College Search

&#x20;  ↓

Enter filters

&#x20;  ↓

System searches database

&#x20;  ↓

Display colleges



Possible filters:



Exam

State

City

Course

Branch

Fees

College type

Rank range



### UC-05: College Predictor ⭐



This is one of our most important use cases.



Actor: Student



Input

Exam

Rank

Score

Category

Course

Branch

State

Processing

Student Data

&#x20;    ↓

Validate Data

&#x20;    ↓

Retrieve Historical Cutoffs

&#x20;    ↓

Prediction Algorithm

&#x20;    ↓

Calculate Probability/Category

&#x20;    ↓

Generate Results

Output

┌─────────────────────────────────┐

│ College A                       │

│ CSE                             │

│                                 │

│ Prediction: HIGH                │

│ Historical Closing Rank: 5200  │

└─────────────────────────────────┘



┌─────────────────────────────────┐

│ College B                       │

│ CSE                             │

│                                 │

│ Prediction: MODERATE            │

│ Historical Closing Rank: 4300  │

└─────────────────────────────────┘



The prediction engine will be designed separately so we can improve it later.



### UC-06: Compare Colleges



Actor: Student

Student selects two or more colleges.

College A ─┐

&#x20;          ├──→ Comparison Engine → Comparison Table

College B ─┘



Compare:



Courses

Fees

Previous cutoffs

Location

Hostel

Facilities

Accreditation

Placement information

Other relevant information



### UC-07: Search Counsellor



Actor: Student



Student can search based on:



Exam

Specialization

Experience

Rating

Price

Availability



Example:



┌─────────────────────────────┐

│ Counsellor A                │

│ KCET / JEE                  │

│ ⭐ 4.8                       │

│ ₹499 / Session              │

│                             │

│       \[View Profile]        │

└─────────────────────────────┘

### UC-08: Book Counselling



Actors: Student + Counsellor



Flow

Student selects counsellor

&#x20;         ↓

View available slots

&#x20;         ↓

Select date/time

&#x20;         ↓

Payment

&#x20;         ↓

Booking confirmed

&#x20;         ↓

Notification sent

&#x20;         ↓

Appointment added



The system should prevent double booking.



### UC-09: Online Counselling



Actors: Student + Counsellor



At the appointment time:



Student ───────────────┐

&#x20;                      │

&#x20;                   Video Call

&#x20;                      │

Counsellor ────────────┘



Additional functionality:



Video

Audio

Chat

Screen sharing

Document sharing

College recommendations



### UC-10: Counsellor Management



Actor: Counsellor



Counsellor can:



Login

&#x20; ↓

Manage Profile

&#x20; ↓

Set Availability

&#x20; ↓

View Appointments

&#x20; ↓

View Student

&#x20; ↓

Conduct Counselling

&#x20; ↓

Add Notes

&#x20; ↓

Provide Recommendations



### UC-11: College Management



Actor: Admin



Admin can:



Add College

Edit College

Delete College

Add Course

Add Branch

Update College Information



### UC-12: Cutoff Management



Actor: Admin



This is particularly important for our college predictor.



Admin can upload/manage:



Exam

Year

College

Course

Branch

Category

Round

Opening Rank

Closing Rank



Example:



Exam	Year	College	Branch	Category	Closing Rank

KCET	2025	College A	CSE	2A	5200

KCET	2025	College B	CSE	2A	6100



Later we can allow CSV/Excel upload instead of entering thousands of records manually.



### UC-13: Admin Dashboard



Admin gets an overview:



&#x20;             ADMIN DASHBOARD



Students             12,542

Counsellors              143

Colleges                2,451

Appointments            4,832



&#x20;            Recent Activity

&#x20;       ─────────────────────────

&#x20;       New student registration

&#x20;       New counsellor application

&#x20;       New booking

&#x20;       Cutoff data update



### Priority Classification

High Priority — MVP

* Registration/Login
* Student Profile
* Exam Selection
* College Database
* College Search
* College Predictor
* College Comparison
* Admin College Management
* Admin Cutoff Management



Medium Priority

* Counsellor Registration
* Counsellor Profiles
* Booking
* Payments
* Notifications



Future

* Video Counselling
* Chat
* AI Counsellor
* Advanced Prediction
* Analytics
* Mobile Application



