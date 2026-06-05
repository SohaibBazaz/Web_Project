# AI-Genius Authentication System

A simple authentication and authorization system built using Node.js, Express, JWT, and RBAC.

The assignment is divided into four separate tasks, with each task stored in its own folder.

## Project Structure

```text
task1/  -> Login and Authentication Workflow
task2/  -> JWT Verification Middleware
task3/  -> Refresh Tokens and Logout
task4/  -> RBAC and Protected AI Endpoints
```

## Test Users

| Email | Password | Role |
|---------|----------|---------|
| admin@aigenius.com | admin123 | Admin |
| premium@aigenius.com | premium123 | Premium_User |
| free@aigenius.com | free123 | Free_User |

## Running a Task

Navigate to any task folder:

```bash
cd task4
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm run dev
```

or

```bash
npm start
```

## Features

### Task 1
- User login
- Password verification using bcrypt
- Access token generation
- Refresh token generation

### Task 2
- JWT verification middleware
- Protected profile route

### Task 3
- Refresh token endpoint
- Logout endpoint
- Refresh token revocation

### Task 4
- Role-based access control (RBAC)
- Free AI endpoint
- Premium AI endpoint
- Admin-only cache purge endpoint

## Testing

A Postman collection is included in the repository for testing all endpoints.

Import the collection into Postman and run the requests after starting the server.
