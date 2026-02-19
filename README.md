# Kodbank

Full-stack banking application with user registration, JWT authentication, and balance checking.

## Setup

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. Configure environment (`.env` is already set up for Aiven MySQL):
   - `DB_URL` - MySQL connection string
   - `JWT_SECRET` - Secret for JWT signing
   - `FRONTEND_URL` - Frontend origin for CORS (default: http://localhost:5173)

3. Run database migration:
   ```bash
   npm run db:migrate
   ```

4. Start the application:
   ```bash
   npm run dev
   ```
   This starts both the backend (port 5000) and frontend (port 5173).

## Usage

- **Register**: Visit http://localhost:5173/register and create an account (role: customer)
- **Login**: Use your username and password
- **Dashboard**: After login, click "Check Balance" to see your balance with celebration animation
