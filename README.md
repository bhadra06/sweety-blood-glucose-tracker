# 🩸 Sweety — Blood Glucose Tracker

### Take control of your glucose journey. One reading at a time.

**Sweety** is a full-stack blood glucose tracking application designed to make daily glucose monitoring simple, organized, and insightful.

It gives users a secure space to record their glucose readings, manage their daily tracking routine, and understand their glucose history through meaningful reports and statistics.

Whether you're recording your morning fasting level or reviewing your monthly progress, Sweety brings your readings together in one clean, intuitive dashboard.

---

## ✨ Why Sweety?

Tracking glucose shouldn't feel complicated.

Sweety transforms everyday glucose records into an organized digital experience with secure authentication, effortless reading management, and useful analytics.

### 🚀 Key Features

| Feature | What it offers |
|---|---|
| 🔐 Secure Authentication | Registration, login, bcrypt password hashing, and JWT authentication |
| 📝 Reading Management | Create, view, update, and delete glucose readings |
| 📅 Daily Tracking | Four predefined reading slots every day |
| 📊 Smart Analytics | High, low, average, and total reading count |
| 📈 Daily Reports | Review individual readings for a selected date |
| 🗓️ Monthly Reports | Month-to-date and previous full-month summaries |
| 🔒 Data Privacy | Users can access only their own readings |
| 🎨 Modern Interface | Responsive design with a premium indigo and lavender theme |

---

## 🩺 Glucose Reading Management

Sweety supports four daily tracking slots:

- **Morning** — Fasting reading
- **After Breakfast**
- **After Lunch**
- **After Dinner**

### Built-in validation

To maintain consistent records, Sweety enforces the following rules:

- Glucose value is mandatory.
- Values must be whole numbers between **40 and 600 mg/dL**.
- Only one reading is allowed per time slot per day.
- A maximum of four readings can be recorded per day.
- Future dates are not accepted.
- Readings are associated with the authenticated user.

---

## 📊 Reports & Analytics

Turn individual readings into useful insights.

Sweety provides three reporting views:

**1. Daily Report**
- Select a date and review its readings.
- View each reading with its corresponding time slot.
- See the highest, lowest, average, and total readings.

**2. Month-to-Date Report**
- Review readings from the beginning of the current month through the reporting date.
- Understand your overall glucose statistics.

**3. Previous Month Report**
- Review the previous complete calendar month.
- Compare your historical glucose statistics.

Average values are rounded to one decimal place. Friendly empty states are displayed when no readings are available.

---

## 🛠️ Technology Stack

Built using a modern JavaScript full-stack architecture.

### Frontend
- React — Component-based user interface
- Vite — Fast development environment
- React Router — Client-side navigation
- Axios — API communication
- Recharts — Data visualization
- Lucide React — Interface icons

### Backend
- Node.js — JavaScript runtime
- Express.js — REST API framework
- PostgreSQL — Relational database
- node-postgres (`pg`) — Database connectivity
- bcrypt — Password hashing
- JSON Web Token — Authentication
- dotenv — Environment configuration

---

## 🏗️ Project Architecture

```text
Sweety/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── seeds/
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run Sweety locally.

### Prerequisites

Make sure you have installed:

- [Node.js (LTS)](https://nodejs.org/)
- npm
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/bhadra06/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Set up the database

Open PostgreSQL or pgAdmin and create a database:

```sql
CREATE DATABASE sweety_db;
```

Connect to `sweety_db` and execute:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_glucose_value
        CHECK (value BETWEEN 40 AND 600),

    CONSTRAINT valid_time_slot
        CHECK (
            time_slot IN (
                'Morning',
                'After breakfast',
                'After lunch',
                'After dinner'
            )
        ),

    CONSTRAINT unique_daily_slot
        UNIQUE (user_id, reading_date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_readings_user_date
ON readings(user_id, reading_date DESC);
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory.

Use `server/.env.example` as your reference.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5433
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgresql_password

JWT_SECRET=your_secure_random_secret
```

**Important:** Use your own PostgreSQL credentials and a secure JWT secret. Never commit your actual `.env` file to GitHub.

### 4. Install and run the backend

Open a terminal:

```bash
cd server
npm install
npm run seed
npm run dev
```

Backend:

`http://localhost:5000`

### 5. Install and run the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

Open the frontend URL in your browser to start using Sweety.

---

## 👤 Demo Account

Want to explore the application quickly?

Run the seed script from the `server` directory:

```bash
npm run seed
```

Use the following demo credentials:

| Field | Demo credentials |
|---|---|
| Email | `demo@sweety.com` |
| Password | `Demo@12345` |

The seed script creates or finds the demo user and inserts sample glucose readings. Existing readings for the same user, date, and time slot are not duplicated.

*This account is intended for local demonstration only.*

---

## 🔌 API Reference

All protected endpoints require a JWT Bearer token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get the logged-in user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Add a glucose reading |
| GET | `/api/readings` | Retrieve user readings |
| GET | `/api/readings/:id` | Retrieve a specific reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Generate a daily report |
| GET | `/api/reports/month-to-date` | Generate a month-to-date report |
| GET | `/api/reports/previous-month` | Generate a previous-month report |

---

## 🧪 Testing & Validation

The application has been manually tested through Postman and the browser interface.

The following workflows were tested:

- User registration and login.
- Adding, viewing, updating, and deleting readings.
- Duplicate time-slot prevention.
- Glucose value validation.
- Daily reading limit enforcement.
- Report calculations.
- User-specific reading access.

---

## 💡 Assumptions & Design Decisions

- Every user manages their own glucose records.
- Each calendar day has four predefined reading slots.
- Glucose values are stored as whole numbers in mg/dL.
- A user can record a maximum of four readings per day.
- Future reading dates are not permitted.
- All reading operations are scoped to the authenticated user.
- Reports are calculated from the user's saved readings.

---

## 🔮 Future Improvements

Sweety is designed with room to grow.

Potential enhancements include:

- [ ] Pagination for reading history.
- [ ] Monthly glucose trend visualizations.
- [ ] Automated frontend and backend tests.
- [ ] Docker-based deployment.
- [ ] Optional doctor and patient accounts.
- [ ] Report filtering and data export.
- [ ] Notifications and reading reminders.

---

## 👨‍💻 About the Project

**Sweety — Blood Glucose Tracker** was developed as a take-home assignment for the **Junior Full Stack Developer – JavaScript & AI** position at **Kenpath**.

The project demonstrates practical implementation of full-stack development concepts, REST API design, database management, authentication, validation, and responsive user interface development.

---

### Made with ❤️ and JavaScript

*Building technology that makes everyday tracking simpler.*