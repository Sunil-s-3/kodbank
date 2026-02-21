# Kodbank

A banking app with user registration, JWT authentication, and balance check.

## Setup

### 1. Database

Run the migration to create tables in Aiven MySQL:

```bash
cd backend
npm install
npm run migrate
```

If tables already exist with wrong schema, run `npm run reset-tables` to drop and recreate them (destructive).

### 2. Backend

```bash
cd backend
npm install
# Ensure .env has DB_URL, JWT_SECRET, JWT_EXPIRY, PORT, FRONTEND_URL
npm run dev
```

Backend runs on http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 (proxies /api to backend)

## Flow

1. Register at /register (user_id, user_name, password, email, phone, role: Customer)
2. Login at /login (username, password) - receives JWT in httpOnly cookie
3. Dashboard at /dashboard - click "Check Balance" to see balance with confetti animation
