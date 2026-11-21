# Express Todo REST API with JWT Authentication & bcrypt

A secure, production-structured Express backend featuring **JWT (JSON Web Token) authentication**, **bcrypt password hashing**, **environment variable configuration via `.env`**, **per-user protected CRUD routes**, and local JSON file persistence.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Authentication Architecture & Workflow](#-authentication-architecture--workflow)
  - [1. User Registration Flow](#1-user-registration-flow)
  - [2. User Login Flow](#2-user-login-flow)
  - [3. Protected Request & Authorization Flow](#3-protected-request--authorization-flow)
  - [4. JWT Token Specification](#4-jwt-token-specification)
  - [5. Password Hashing with bcrypt](#5-password-hashing-with-bcrypt)
- [Project Architecture (MVC)](#-project-architecture-mvc)
- [Environment Configuration (`.env`)](#-environment-configuration-env)
- [Quick Start Guide](#-quick-start-guide)
- [API Reference](#-api-reference)
  - [Public Authentication Endpoints](#1-public-authentication-endpoints)
  - [Protected Task Endpoints](#2-protected-task-endpoints)
- [Authentication Middleware Details](#-authentication-middleware-details)
- [Data Storage Schema](#-data-storage-schema)
- [Frontend (React) Integration Guide](#-frontend-react-integration-guide)
- [Testing the API](#-testing-the-api)
- [Security Best Practices](#-security-best-practices)

---

## 📌 Overview

This project implements an Express REST API with role/user-based data isolation. Users must register and log in to obtain a JSON Web Token. Subsequent requests to all task management endpoints require passing this token in the standard HTTP `Authorization` header (`Bearer <token>`). Every task is strictly scoped to the authenticated user ID extracted from the token, preventing unauthorized access across accounts.

---

## ✨ Key Features

- 🔐 **bcrypt Password Hashing**: Passwords are cryptographically salted and hashed using `bcryptjs` (10 salt rounds) before storing. Plaintext passwords are never saved or returned in API responses.
- 🎟️ **Stateless JWT Authentication**: Issues cryptographically signed JSON Web Tokens (`jsonwebtoken`) with a 24-hour expiration window.
- 🛡️ **Centralized Auth Middleware**: [`authenticateToken`](./middleware/authenticateToken.js) middleware validates Bearer tokens on all `/tasks` routes, extracting and attaching the authenticated user context to `req.user`.
- 👤 **Per-User Data Isolation (Multi-Tenancy)**: Tasks are tied to the creator's `userId`. Users can only view, create, edit, and delete their own tasks.
- ⚙️ **Environment Configuration**: Sensitive variables such as `JWT_SECRET` and server `PORT` are managed via `.env` using `dotenv`.
- 📖 **Interactive HTML Documentation**: Serving an interactive API reference and guide at the base endpoint (`GET /`).
- 💾 **Local File Persistence**: Data is persisted in [`users.json`](./users.json) and [`tasks.json`](./tasks.json) using atomic JSON operations.
- 🧪 **Automated REST Client Suite**: Ready-to-run HTTP test cases in [`todo-api.rest`](./todo-api.rest) with automatic token chaining.

---

## 🔐 Authentication Architecture & Workflow

### 1. User Registration Flow

```
Client (POST /register)
   │
   ├─► [Validation] Check username & password (min 4 chars)
   │     └─► Invalid: Return 400 Bad Request
   │
   ├─► [Check Existing] Query users.json (case-insensitive username check)
   │     └─► Exists: Return 409 Conflict
   │
   ├─► [Hash Password] bcrypt.hash(password, 10 salt rounds)
   │
   ├─► [Persist User] Save { id, username, password: <hash>, createdAt } to users.json
   │
   └─► Return 201 Created: { message, username } (password omitted)
```

### 2. User Login Flow

```
Client (POST /login)
   │
   ├─► [Validation] Check presence of username and password
   │     └─► Missing: Return 400 Bad Request
   │
   ├─► [Lookup User] Query users.json for username
   │     └─► Not found: Return 401 Unauthorized
   │
   ├─► [Verify Hash] bcrypt.compare(password, user.password)
   │     └─► No match: Return 401 Unauthorized
   │
   ├─► [Generate JWT] Sign token using JWT_SECRET:
   │     - Subject (sub): user.id
   │     - Payload: { username }
   │     - Expiration: 24h
   │
   └─► Return 200 OK: { message, token, username }
```

### 3. Protected Request & Authorization Flow

```
Client Request (e.g. GET /tasks, POST /tasks)
   │  Header: "Authorization: Bearer <jwt_token>"
   │
   ├─► [authenticateToken Middleware]
   │     ├─► No Authorization header?  ──► Return 401 Unauthorized
   │     ├─► Malformed header format? ──► Return 401 Unauthorized
   │     ├─► jwt.verify() fails/expired? ──► Return 403 Forbidden
   │     ├─► Invalid user ID in sub?   ──► Return 403 Forbidden
   │     └─► Success: Attach req.user = { username, userId, ... } -> next()
   │
   ├─► [Task Controller]
   │     - Reads req.user.userId from verified token (client cannot spoof userId)
   │     - Scopes database query to match task.userId === req.user.userId
   │
   └─► Return 200/201 Response with user-scoped task data
```

### 4. JWT Token Specification

| Component | Setting / Value | Description |
| :--- | :--- | :--- |
| **Algorithm** | HS256 (HMAC-SHA256) | Default symmetric signature algorithm |
| **Secret Key** | `process.env.JWT_SECRET` | Loaded from `.env` |
| **Expiration** | `24h` (24 Hours) | Tokens automatically expire after 1 day |
| **Subject (`sub`)**| `String(user.id)` | Unique user ID stored in token subject claim |
| **Payload** | `{ "username": user.username }` | Public user profile attributes |

**Example Decoded JWT Payload:**
```json
{
  "username": "student_demo",
  "sub": "1793340969522",
  "iat": 1793340969,
  "exp": 1793427369
}
```

### 5. Password Hashing with bcrypt

- Passwords are never stored as plaintext.
- Salt generation is handled using **10 salt rounds** (`$2b$10$...`), providing strong defense against dictionary and rainbow table attacks.
- Verification uses `bcrypt.compare()` which executes in constant-time comparison to prevent timing side-channel attacks.

---

## 🏗️ Project Architecture (MVC)

The codebase follows the Model-View-Controller pattern, cleanly separating authentication and business logic:

```text
todo-list-server/
├── .env                              # Environment secrets (JWT_SECRET, PORT)
├── .env.example                      # Template for environment configuration
├── app.js                            # Express app configuration & middleware mounts
├── server.js                         # Server entry point & listener
├── config/
│   └── index.js                      # Centralized configuration loader
├── controllers/
│   ├── authController.js             # User registration & login handlers
│   ├── taskController.js             # Protected CRUD task operations
│   └── homeController.js             # HTML documentation guide handler
├── middleware/
│   └── authenticateToken.js          # JWT Bearer token validation middleware
├── models/
│   ├── userModel.js                  # User storage and query methods
│   ├── taskModel.js                  # User-scoped task storage methods
│   └── jsonFileStore.js              # Generic async JSON file reader/writer
├── routes/
│   ├── authRoutes.js                 # Public auth routes (/register, /login)
│   ├── taskRoutes.js                 # Protected task routes (/tasks)
│   └── homeRoutes.js                 # Documentation route (/)
├── templates/
│   └── apiGuideTemplate.js           # HTML guide page template
├── users.json                        # Persisted user credentials (hashed)
├── tasks.json                        # Persisted tasks (user-scoped)
└── todo-api.rest                     # VS Code REST Client test execution suite
```

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root directory before running the server (refer to [`.env.example`](./.env.example)):

```env
# Server Port
PORT=5000

# JSON Web Token Secret Key (Use a strong random string in production)
JWT_SECRET=super_secret_jwt_key_for_development_replace_in_prod

# Optional task simulation delay in milliseconds (default: 0)
DELAY_MS=0
```

> [!WARNING]
> Never commit real secrets or production `.env` files to source control. The `.gitignore` file is configured to exclude `.env`.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Ensure `JWT_SECRET` has a secure value set)*

### 3. Run the Server
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode (with auto-reload on changes):**
  ```bash
  npm run dev
  ```

Server will run at: `http://localhost:5000`

---

## 📡 API Reference

### 1. Public Authentication Endpoints

These endpoints do not require an `Authorization` header.

#### `POST /register`
Registers a new user account. Hashes the password before storing.

- **Request Body:**
  ```json
  {
    "username": "student_demo",
    "password": "Password@123"
  }
  ```
- **Validation Rules:**
  - `username`: Required, non-empty string (trimmed, case-insensitive uniqueness check).
  - `password`: Required string, minimum **4 characters**.
- **Success Response (`201 Created`):**
  ```json
  {
    "message": "User registered successfully. You can now log in.",
    "username": "student_demo"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "error": "Username and password are required." }` or `{ "error": "Password must be at least 4 characters long." }`
  - `409 Conflict`: `{ "error": "Username already exists. Please choose another." }`

---

#### `POST /login`
Authenticates user credentials and returns a signed JWT token.

- **Request Body:**
  ```json
  {
    "username": "student_demo",
    "password": "Password@123"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0dWRlbnRfZGVtbyIsInN1YiI6IjE3OTMzNDA5Njk1MjIiLCJpYXQiOjE3OTMzNDA5NjksImV4cCI6MTc5MzQyNzM2OX0...",
    "username": "student_demo"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "error": "Username and password are required." }`
  - `401 Unauthorized`: `{ "error": "Invalid username or password." }`

---

### 2. Protected Task Endpoints

> [!IMPORTANT]
> All task endpoints require the HTTP Header:  
> `Authorization: Bearer <your_jwt_token>`

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieve all tasks owned by authenticated user | *None* | `200 OK` |
| **POST** | `/tasks` | Create a new task (automatically assigned to user) | `{ "message": "Learn JWT Auth" }` | `201 Created` |
| **PUT** | `/tasks/:id` | Update an existing task owned by user | `{ "message": "Updated task content" }` | `200 OK` |
| **DELETE** | `/tasks/:id` | Delete a task owned by user | *None* | `200 OK` |

#### Detailed Protected Endpoint Behaviors:

- **`GET /tasks`**: Returns a JSON array of tasks where `task.userId === req.user.userId`. Other users' tasks are never returned.
- **`POST /tasks`**: Creates a task with:
  ```json
  {
    "id": 1793450700000,
    "message": "Learn JWT Auth",
    "userId": 1793340969522,
    "createdBy": "student_demo"
  }
  ```
  The `userId` and `createdBy` fields are derived strictly from the verified JWT payload. Any `userId` supplied by the client in the request body is safely ignored.
- **`PUT /tasks/:id`**: Updates the task if and only if `task.id === id` and `task.userId === req.user.userId`. If a user attempts to update another user's task or a non-existent task, the server responds with `404 Not Found`.
- **`DELETE /tasks/:id`**: Removes the task if and only if it belongs to the authenticated user. Responds with `404 Not Found` if the task does not belong to the user.

---

## 🛡️ Authentication Middleware Details

The [`authenticateToken`](./middleware/authenticateToken.js) middleware guards all task routes.

```javascript
// routes/taskRoutes.js
const router = express.Router();

// Mount authentication middleware to protect all routes below
router.use(authenticateToken);

router.get('/', taskController.listTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
```

### Middleware Logic Breakdown:

1. **Header Inspection**: Checks for `req.headers.authorization`.
2. **Bearer Extraction**: Validates format using regex `/^Bearer\s+(.+)$/i`. If missing or invalid, immediately returns:
   ```json
   // Status: 401 Unauthorized
   { "error": "Authentication required." }
   ```
3. **Cryptographic Verification**: Calls `jwt.verify(token, jwtSecret)`.
4. **Subject Integrity Check**: Validates that `sub` is a safe, positive integer.
5. **Context Injection**: Attaches decoded information to `req.user`:
   ```javascript
   req.user = { ...decodedToken, userId: Number(decodedToken.sub) };
   ```
6. **Error Interception**: If the token has expired, been altered, or signed with an incorrect secret:
   ```json
   // Status: 403 Forbidden
   { "error": "Invalid or expired token." }
   ```

---

## 💾 Data Storage Schema

### `users.json`
Stores user records with bcrypt-hashed passwords:
```json
[
  {
    "id": 1793340969522,
    "username": "student_demo",
    "password": "$2b$10$q.zoZYJKF3WErbRyS3zFTO2OWtUQX.SjYy2BpymQUv3QoSaN0M2gy",
    "createdAt": "2026-10-30T06:16:09.522Z"
  }
]
```

### `tasks.json`
Stores task items linked via `userId`:
```json
[
  {
    "id": 1793341050123,
    "message": "Complete MERN Authentication",
    "userId": 1793340969522,
    "createdBy": "student_demo"
  }
]
```

---

## ⚛️ Frontend (React) Integration Guide

Here is how to integrate the authentication and protected task endpoints in a React application:

### 1. User Registration (`handleRegister`)
```javascript
const handleRegister = async (username, password) => {
  try {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    alert("Registration successful! Please log in.");
  } catch (err) {
    alert(err.message);
  }
};
```

### 2. User Login & Token Storage (`handleLogin`)
```javascript
const handleLogin = async (username, password) => {
  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    // Store JWT token and username in localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUsername", data.username);
    return data;
  } catch (err) {
    alert(err.message);
  }
};
```

### 3. Fetching Tasks with Bearer Token & Expiry Handling
```javascript
import { useEffect, useState } from "react";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/tasks", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid -> log user out
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUsername");
          window.location.reload();
          throw new Error("Session expired. Please log in again.");
        }
        return res.json();
      })
      .then((data) => setTasks(data))
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.message}</li>
      ))}
    </ul>
  );
}
```

### 4. Creating a Protected Task (`handleAddTask`)
```javascript
const handleAddTask = async (message) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch("http://localhost:5000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  if (res.ok) {
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
  }
};
```

### 5. Logging Out
```javascript
const handleLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUsername");
  window.location.reload();
};
```

---

## 🧪 Testing the API

### 1. Using VS Code REST Client (`todo-api.rest`)
The included [`todo-api.rest`](./todo-api.rest) file contains a pre-configured, automated test suite:
1. Install the **REST Client** extension in VS Code.
2. Open [`todo-api.rest`](./todo-api.rest).
3. Click **Send Request** on `POST /login` — the response token is automatically saved into variable `@authToken`.
4. Run subsequent `/tasks` requests without manually copying and pasting tokens!

### 2. Testing via cURL

**Register:**
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\", \"password\": \"secret123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\", \"password\": \"secret123\"}"
```

**Get Tasks (replace `<TOKEN>`):**
```bash
curl -X GET http://localhost:5000/tasks \
  -H "Authorization: Bearer <TOKEN>"
```

**Add Task:**
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d "{\"message\": \"Master JWT Authentication\"}"
```

---

## 🔒 Security Best Practices Implemented

1. **One-Way Password Encryption**: Passwords cannot be decrypted or retrieved from the database.
2. **No Credential Leakage**: User passwords (even hashes) are omitted from registration, login, and task responses.
3. **Stateless Authorization**: Server does not maintain sessions in memory, allowing easy scaling.
4. **Token Expiration**: Access tokens are bounded by a 24-hour lifetime.
5. **Data Ownership Isolation**: All CRUD mutations verify that the resource's `userId` matches the token claim.
6. **Defense against ID Spoofing**: `req.user.userId` is derived exclusively from the verified token signature, ignoring any untrusted `userId` passed in request payloads.
