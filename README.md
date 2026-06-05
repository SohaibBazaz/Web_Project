# AI-Genius: Secure Stateless Authentication & Authorization Subsystem

This repository contains the implementation of a secure, stateless authentication and authorization subsystem for the SaaS platform **"AI-Genius"** using **Node.js/Express**, **JSON Web Tokens (JWT)**, and **Role-Based Access Control (RBAC)**.

To satisfy the submission requirement that **"Every task needs to be separate so I can submit properly,"** this project is structured into four distinct directories, with each directory building incrementally upon the previous one.

---

## 📁 Directory Structure & Assignment Overview

```text
Web_Project/
├── task1/                          # Task 1: Architecture & Login Workflow
│   ├── src/
│   │   ├── db.js                   # Seeded users in mock database, bcrypt hashing
│   │   └── app.js                  # Express setup, login endpoint, cookie generation
│   ├── .env & .env.example         # Token lifecycles and secrets configuration
│   └── package.json                # Dependencies for Task 1
│
├── task2/                          # Task 2: JWT Structure & protect Middleware
│   ├── src/
│   │   ├── middlewares/
│   │   │   └── auth.js             # Protect verification middleware
│   │   ├── db.js
│   │   └── app.js                  # Mounts protect middleware on /api/auth/profile
│   ├── .env & .env.example
│   └── package.json
│
├── task3/                          # Task 3: Silent Refresh & Lifecycle Management
│   ├── src/
│   │   ├── middlewares/
│   │   │   └── auth.js
│   │   ├── db.js                   # Whitelist store for active refresh tokens
│   │   └── app.js                  # /api/auth/refresh and /api/auth/logout (revocation)
│   ├── .env & .env.example
│   └── package.json
│
├── task4/                          # Task 4: Complete Solution & RBAC AI Endpoints
│   ├── src/
│   │   ├── middlewares/
│   │   │   ├── auth.js             # Token verification
│   │   │   └── rbac.js             # restrictTo(...roles) middleware factory
│   │   ├── db.js
│   │   └── app.js                  # Integrates protect & restrictTo on Mock AI endpoints
│   ├── .env & .env.example
│   └── package.json
│
├── AI-Genius-Postman-Collection.json # Postman collection for automatic end-to-end testing
└── README.md                       # Documentation (This file)
```

---

## 🔑 Pre-seeded Test Users

The mock database in each task is pre-seeded on startup. Passwords are dynamically generated and verified using `bcryptjs`. You can use the following credentials to test the authentication and role privileges:

| Email | Password | Role | Access Level |
| :--- | :--- | :--- | :--- |
| `admin@aigenius.com` | `admin123` | **Admin** | Full access to Free AI, Premium AI, and Cache Purge |
| `premium@aigenius.com` | `premium123` | **Premium_User** | Access to Free AI and Premium AI models |
| `free@aigenius.com` | `free123` | **Free_User** | Access to Free AI model only |

---

## ⚡ Task Breakdown & Technical Solutions

### Task 1: Architecture & Authentication Workflow (Port `5001`)
- **Seeded Mock Database**: An in-memory store in `src/db.js` holds users with pre-hashed passwords using `bcryptjs`.
- **Login Endpoint (`POST /api/auth/login`)**:
  - Validates credentials using `bcrypt.compare`.
  - Generates a short-lived Access Token returned in the JSON payload.
  - Generates a long-lived Refresh Token stored securely in an `httpOnly`, `secure` (in production), `sameSite=strict` cookie.

### Task 2: JWT Structure & Verification Middleware (Port `5002`)
- **Payload Design**: The Access Token payload includes `id`, `email`, and `role`. Critical secrets like passwords are excluded.
- **Verification Middleware (`protect`)**: Custom middleware in `src/middlewares/auth.js` checks the `Authorization: Bearer <token>` header, verifies the JWT using `JWT_SECRET`, checks if the user exists, and attaches the payload to `req.user`.
- **Verification Endpoint**: A protected route `/api/auth/profile` displays the attached `req.user` details to verify correctness.

### Task 3: Token Expiration & Silent Refresh (Port `5003`)
- **Refresh Endpoint (`POST /api/auth/refresh`)**:
  - Automatically called by client-side apps when the access token expires.
  - Reads the long-lived refresh token from the secure cookie, validates its signature, and cross-references it against a database-backed whitelist.
  - Generates and returns a fresh, short-lived Access Token.
- **Logout Endpoint (`POST /api/auth/logout`)**: Clears the cookie and deletes the refresh token from the database whitelist, rendering it invalid for subsequent refresh calls.

### Task 4: Role-Based Access Control (RBAC) (Port `5004`)
- **Authorization Middleware Factory (`restrictTo(...roles)`)**: Custom middleware factory in `src/middlewares/rbac.js` checking `req.user.role`. Returns `403 Forbidden` with a JSON payload if the user lacks the role.
- **AI Endpoints**:
  1. `GET /api/ai/free-model` - Accessible by all logged-in users.
  2. `POST /api/ai/premium-model` - Accessible only by `Premium_User` and `Admin`.
  3. `DELETE /api/ai/purge-cache` - Accessible only by `Admin`.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 2. Running a Task (e.g., Task 4 - Complete Solution)
Navigate to the directory of the task you want to run (e.g. `task4` or `task1`), install dependencies, and start the development server:

```bash
# Navigate to the task directory
cd task4

# Install dependencies (express, jsonwebtoken, bcryptjs, cookie-parser, dotenv)
npm install

# Start the application in development mode (using nodemon)
npm run dev

# Or start the server in production mode
npm start
```

*Note: Each task is pre-configured to run on its own port (`5001` - `5004`) to prevent port conflicts.*

---

## 🧪 Testing with Postman

An automated Postman collection is provided in the root directory: **`AI-Genius-Postman-Collection.json`**.

### How to use the collection:
1. Open Postman.
2. Click **Import** and select the `AI-Genius-Postman-Collection.json` file.
3. Start the **Task 4 Server** (`cd task4 && npm run dev` on port `5004`).
4. Select the imported collection in Postman.
5. Under the collection's **Variables** tab, the default `baseUrl` is set to `http://localhost:5004`.
6. Run the requests in order:
   - **01. Authentication & Session**:
     - Running any login request (Free, Premium, or Admin) will automatically update the `{{accessToken}}` collection variable via a post-request test script.
     - You can query `GET /api/auth/profile` to see the verified payload attached to `req.user`.
     - Call `/api/auth/refresh` to verify silent refresh issues a new token.
     - Call `/api/auth/logout` to clear tokens and check that subsequent refreshes are rejected.
   - **02. AI Endpoints (RBAC)**:
     - Log in as different users to test authorization. Admin has access to all 3 routes; Free User will receive a `403 Forbidden` response for premium routes.
   - **03. Error & Security Scenarios**:
     - Pre-configured requests to verify appropriate status codes: `401 Unauthorized` for missing/invalid tokens, and `403 Forbidden` for unauthorized roles.
