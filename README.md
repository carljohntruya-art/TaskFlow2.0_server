## Backend Setup & Run Instructions

1. **Navigate to the server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret in `.env`

   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   - Ensure PostgreSQL is running.
   - Create a database matching `DB_NAME` in your `.env` file (e.g., `taskflow`).
   - Connect to your database and run the schema setup (schema scripts can be derived from the models).

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

The server should now be running on the port specified in your `.env` (default is `5000`).
