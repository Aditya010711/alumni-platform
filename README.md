# Digital Platform for Centralized Alumni Data Management

A full-stack MERN application for managing alumni connections, directory, and professional profiles.

## Technologies Used
*   **MongoDB**: Database
*   **Express**: Backend Web Framework
*   **React (Vite)**: Frontend UI Library
*   **Node.js**: JavaScript Runtime environment
*   **TailwindCSS**: Utility-first CSS framework for styling

## Environment Variables
Before running the application, you **MUST** update the environment variables in `backend/.env`. Specifically, the platform will crash on startup if `MONGO_URI` is not set to a valid connection string.

Inside `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

## Setup & Running the Project

1. **Install Dependencies:**
   Run the following command in the root directory. It will install dependencies for the root, backend, and frontend folders:
   ```bash
   npm run install-all
   ```

2. **Start the Application:**
   Run the root dev script to start both the Express backend and the Vite frontend concurrently:
   ```bash
   npm run dev
   ```

3. **Access the App:**
   - Frontend is accessible at `http://localhost:5173`
   - Backend API is accessible at `http://localhost:5000`

## Features Let's you 
*   User Registration & Login (JWT Authentication)
*   Create, view, and update Alumni Professional Profiles
*   Browse the searchable Alumni Directory
*   Responsive and modern UI (TailwindCSS)
