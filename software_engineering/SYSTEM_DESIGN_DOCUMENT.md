Technology Stack



We'll use:



Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* React Router

Backend

* Node.js
* Express.js
* TypeScript
* Database
* PostgreSQL

Other services

* JWT → authentication
* Razorpay → payments
* Cloud storage → documents
* WebRTC / video service → online counselling
* Git + GitHub → version control





HIGH LEVEL ARCHITECTURE



&#x20;                        USERS

&#x20;                          │

&#x20;            ┌─────────────┼─────────────┐

&#x20;            │             │             │

&#x20;            ▼             ▼             ▼

&#x20;        STUDENT       COUNSELLOR       ADMIN

&#x20;            │             │             │

&#x20;            └─────────────┼─────────────┘

&#x20;                          │

&#x20;                          ▼

&#x20;               ┌─────────────────────┐

&#x20;               │    REACT FRONTEND   │

&#x20;               │                     │

&#x20;               │  UI + Components    │

&#x20;               │  Pages + Forms      │

&#x20;               │  State Management   │

&#x20;               └──────────┬──────────┘

&#x20;                          │

&#x20;                      HTTPS / REST

&#x20;                          │

&#x20;                          ▼

&#x20;               ┌─────────────────────┐

&#x20;               │    EXPRESS API      │

&#x20;               │                     │

&#x20;               │ Routes              │

&#x20;               │ Controllers         │

&#x20;               │ Middleware          │

&#x20;               │ Validation          │

&#x20;               └──────────┬──────────┘

&#x20;                          │

&#x20;                          ▼

&#x20;               ┌─────────────────────┐

&#x20;               │   BUSINESS LOGIC    │

&#x20;               │                     │

&#x20;               │ Prediction Engine   │

&#x20;               │ Booking Logic       │

&#x20;               │ Recommendation      │

&#x20;               │ Payment Logic       │

&#x20;               └──────────┬──────────┘

&#x20;                          │

&#x20;                          ▼

&#x20;               ┌─────────────────────┐

&#x20;               │     POSTGRESQL      │

&#x20;               │                     │

&#x20;               │ Users               │

&#x20;               │ Colleges            │

&#x20;               │ Courses             │

&#x20;               │ Cutoffs             │

&#x20;               │ Appointments        │

&#x20;               │ Payments            │

&#x20;               └─────────────────────┘



Frontend Architecture



frontend/

│

├── public/

│   ├── images/

│   └── icons/

│

├── src/

│   │

│   ├── assets/

│   │   ├── images/

│   │   └── logos/

│   │

│   ├── components/

│   │   ├── Navbar/

│   │   ├── Footer/

│   │   ├── Button/

│   │   ├── Input/

│   │   ├── Modal/

│   │   ├── CollegeCard/

│   │   ├── CollegeTable/

│   │   └── CounsellorCard/

│   │

│   ├── pages/

│   │   │

│   │   ├── Home/

│   │   │   └── Home.jsx

│   │   │

│   │   ├── Auth/

│   │   │   ├── Login.jsx

│   │   │   └── Register.jsx

│   │   │

│   │   ├── Student/

│   │   │   ├── Dashboard.jsx

│   │   │   ├── Profile.jsx

│   │   │   ├── Predictor.jsx

│   │   │   ├── Colleges.jsx

│   │   │   ├── Compare.jsx

│   │   │   ├── Counsellors.jsx

│   │   │   └── Appointments.jsx

│   │   │

│   │   ├── Counsellor/

│   │   │   ├── Dashboard.jsx

│   │   │   ├── Profile.jsx

│   │   │   ├── Appointments.jsx

│   │   │   └── Students.jsx

│   │   │

│   │   └── Admin/

│   │       ├── Dashboard.jsx

│   │       ├── Students.jsx

│   │       ├── Counsellors.jsx

│   │       ├── Colleges.jsx

│   │       └── Cutoffs.jsx

│   │

│   ├── layouts/

│   │   ├── StudentLayout.jsx

│   │   ├── CounsellorLayout.jsx

│   │   └── AdminLayout.jsx

│   │

│   ├── services/

│   │   ├── api.js

│   │   ├── authService.js

│   │   ├── collegeService.js

│   │   ├── predictorService.js

│   │   ├── counsellorService.js

│   │   └── appointmentService.js

│   │

│   ├── context/

│   │   ├── AuthContext.jsx

│   │   └── AppContext.jsx

│   │

│   ├── hooks/

│   │   ├── useAuth.js

│   │   └── useFetch.js

│   │

│   ├── routes/

│   │   └── AppRoutes.jsx

│   │

│   ├── utils/

│   │   ├── validation.js

│   │   └── helpers.js

│   │

│   ├── App.jsx

│   └── main.jsx

│

├── package.json

└── vite.config.js



BACKEND ARCHITECTURE





backend/

│

├── src/

│   │

│   ├── config/

│   │   ├── database.js

│   │   └── env.js

│   │

│   ├── routes/

│   │   ├── auth.routes.js

│   │   ├── student.routes.js

│   │   ├── college.routes.js

│   │   ├── predictor.routes.js

│   │   ├── counsellor.routes.js

│   │   ├── appointment.routes.js

│   │   ├── payment.routes.js

│   │   └── admin.routes.js

│   │

│   ├── controllers/

│   │   ├── auth.controller.js

│   │   ├── student.controller.js

│   │   ├── college.controller.js

│   │   ├── predictor.controller.js

│   │   ├── counsellor.controller.js

│   │   ├── appointment.controller.js

│   │   └── admin.controller.js

│   │

│   ├── services/

│   │   ├── auth.service.js

│   │   ├── student.service.js

│   │   ├── college.service.js

│   │   ├── predictor.service.js

│   │   ├── counsellor.service.js

│   │   ├── appointment.service.js

│   │   └── payment.service.js

│   │

│   ├── models/

│   │   ├── user.model.js

│   │   ├── student.model.js

│   │   ├── college.model.js

│   │   ├── course.model.js

│   │   ├── cutoff.model.js

│   │   ├── counsellor.model.js

│   │   └── appointment.model.js

│   │

│   ├── middleware/

│   │   ├── auth.middleware.js

│   │   ├── role.middleware.js

│   │   ├── validation.middleware.js

│   │   └── error.middleware.js

│   │

│   ├── utils/

│   │   ├── jwt.js

│   │   ├── password.js

│   │   └── validators.js

│   │

│   ├── predictor/

│   │   ├── predictor.engine.js

│   │   └── ranking.logic.js

│   │

│   ├── app.js

│   └── server.js

│

├── .env

├── package.json

└── README.md



ROLE BASED ACCESS CONTROL

| Feature             | Student | Counsellor | Admin |

| ------------------- | :-----: | :--------: | :---: |

| College Search      |    ✅    |      ✅     |   ✅   |

| College Predictor   |    ✅    |      ✅     |   ✅   |

| Book Counselling    |    ✅    |      ❌     |   ✅   |

| Manage Appointments |   Own   |     Own    |  All  |

| Manage Colleges     |    ❌    |      ❌     |   ✅   |

| Manage Cutoffs      |    ❌    |      ❌     |   ✅   |

| Manage Users        |    ❌    |      ❌     |   ✅   |









