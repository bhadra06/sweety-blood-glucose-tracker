
# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application that allows users to securely record, manage, and monitor their glucose readings. Users can add up to four readings per day across different time slots and view daily and monthly reports.

## Features

### Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Users can access only their own readings.

### Glucose Reading Management
- Add, view, update, and delete glucose readings.
- Four daily time slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Validation:
  - Glucose value is required.
  - Values must be whole numbers between 40 and 600 mg/dL.
  - Only one reading per time slot per day.
  - Maximum of four readings per day.
  - Future dates are not allowed.

### Reports
- Daily report for a selected date.
- Month-to-date report.
- Previous full-month report.
- Highest, lowest, average, and total reading count.
- Individual readings and time slots in the daily report.
- Friendly empty states when no readings exist.

### User Interface
- Responsive React interface.
- Dashboard with glucose statistics.
- Reading history management.
- Analytics and reports.
- Premium indigo and lavender visual theme.

## Technology Stack

**Frontend**
- React
- Vite
- React Router
- Axios
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- PostgreSQL
- node-postgres (pg)
- bcrypt
- JSON Web Token
- dotenv

## Project Structure

```text
Sweety/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── seeds/
│   │       └── seed.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js (LTS)
- npm
- PostgreSQL
- Git

## Database Setup

1. Open PostgreSQL or pgAdmin.
2. Create a database named `sweety_db`.
3. Run the following SQL to create the required tables:

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
    CONSTRAINT valid_glucose_value CHECK (value BETWEEN 40 AND 600),
    CONSTRAINT valid_time_slot CHECK (
        time_slot IN (
            'Morning',
            'After breakfast',
            'After lunch',
            'After dinner'
        )
    ),
    CONSTRAINT unique_daily_slot UNIQUE (
        user_id,
        reading_date,
        time_slot
    )
);

CREATE INDEX IF NOT EXISTS idx_readings_user_date
ON readings(user_id, reading_date DESC);
```

## Environment Variables

Create a `.env` file inside the `server` directory.

Use the following variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_secure_random_secret
```

Use your own PostgreSQL credentials and a secure JWT secret.

Never commit your actual `.env` file to GitHub.

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Sweety
```

### Backend Setup

```bash
cd server
npm install
```

Create your `.env` file using the environment variables listed above.

Start the backend:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## Demo Account

Run the database seed script from the server directory:

```bash
npm run seed
```

Demo credentials:

- Email: demo@sweety.com
- Password: Demo@12345

The seed script creates the demo user and inserts sample glucose readings. It avoids duplicate readings when run again.

This account is intended for local demonstration only.

## API Endpoints

All protected endpoints require a JWT Bearer token.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get logged-in user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/readings | Add reading |
| GET | /api/readings | Get all user readings |
| GET | /api/readings/:id | Get one reading |
| PUT | /api/readings/:id | Update reading |
| DELETE | /api/readings/:id | Delete reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/daily?date=YYYY-MM-DD | Daily report |
| GET | /api/reports/month-to-date | Month-to-date report |
| GET | /api/reports/previous-month | Previous-month report |

## Testing

Backend API endpoints were tested using Postman.

The application was manually tested for:
- Registration and login.
- Adding, viewing, updating, and deleting readings.
- Duplicate time-slot validation.
- Glucose value validation.
- Daily reading limits.
- Report calculations.
- User-specific reading access.

## Assumptions

- Each user can record a maximum of four readings per calendar day.
- Each of the four time slots can have only one reading per day.
- Glucose values are stored as whole numbers in mg/dL.
- Reading dates cannot be in the future.
- All readings are private to the authenticated user.
- Reports are calculated using the user's saved readings.

## Future Improvements

- Add pagination to reading history.
- Add monthly glucose trend visualizations.
- Add automated frontend and backend tests.
- Introduce Docker-based deployment.
- Add optional doctor and patient accounts.
- Improve report filtering and data export.

## Author

Developed as a take-home assignment for the Junior Full Stack Developer – JavaScript & AI position at Kenpath.
