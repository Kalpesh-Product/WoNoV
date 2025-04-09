# 🛠️ WoNo REST API Documentation

## 📖 Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Available Routes](#available-routes)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [License](#license)

---

## 🚀 Introduction

**WoNo** is a modular and scalable backend API built with **Node.js**, designed for enterprise-level management systems. It supports features like authentication, attendance tracking, payroll, ticketing, budgeting, visitor logs, and more — ideal for managing operations across multiple departments and roles.

---

## 🧰 Tech Stack

| Technology     | Usage                            |
|----------------|----------------------------------|
| Node.js        | Backend runtime environment      |
| Express.js     | Web framework                    |
| MongoDB + Mongoose | Database + ODM                |
| JWT            | Authentication                   |
| Redis (ioredis) | Caching, real-time features      |
| Socket.IO      | Real-time communication          |
| Cloudinary     | File/Image uploads               |
| Multer         | Handling `multipart/form-data`   |
| Nodemailer     | Sending emails                   |
| dotenv         | Environment variable management  |
| bcryptjs       | Password hashing                 |
| sharp          | Image optimization               |
| node-schedule  | Cron job scheduling              |

---

## ✨ Features

- JWT-based Authentication and Authorization
- Role-based Access Control
- Attendance and Leave Management
- Real-time Events using Socket.IO
- Budget and Payroll Management
- Department and Designation Hierarchies
- Ticketing System
- File Uploads via Multer and Cloudinary
- Scheduled Jobs via `node-schedule`
- Visitor, Vendor, and Asset Management
- Inventory and Task Tracking
- Dynamic Website Templates
- Centralized Error Logging
- Custom Middleware Support

---

## ⚙️ Getting Started

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/client-backend.git
cd client-backend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Setup environment variables:

Create a `.env` file in the root directory and add:
```env
PORT=5000
DB_URL=mongodb://localhost:27017/wono
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4. Start the server:
```bash
# For development
npm run dev

# For production
npm start
```

---

## 🗂️ Folder Structure

```
.
├── config/                # DB and CORS configs
├── controllers/           # Route controllers
├── events/                # Socket/event listeners
├── middlewares/           # Custom middleware (auth, error handlers)
├── models/                # Mongoose schemas
├── public/                # Static files
├── routes/                # API route handlers
├── views/                 # HTML templates (home, 404)
├── server.js              # App entry point
└── package.json           # Project metadata and dependencies
```

---

## 🔐 Middleware

| Middleware         | Purpose                                |
|--------------------|----------------------------------------|
| `verifyJwt`        | Secures routes using JWT verification  |
| `credentials`      | Manages CORS with credential support   |
| `errorHandler`     | Global error handling                  |

---

## 📡 Available Routes

### 🔑 Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/refresh`
- `POST /api/auth/logout`

### 🧍 Users & Roles
- `GET /api/users`
- `GET /api/roles`
- `GET /api/departments`
- `GET /api/designations`

### 🏢 Company / Admin
- `GET /api/company`
- `GET /api/administration`

### 📅 Attendance / Leave
- `GET /api/attendance`
- `GET /api/leaves`

### 🎫 Tickets & Tasks
- `GET /api/tickets`
- `GET /api/tasks`

### 📦 Inventory / Assets
- `GET /api/inventory`
- `GET /api/assets`

### 💰 Budget / Payroll / Sales
- `GET /api/budget`
- `GET /api/payroll`
- `GET /api/sales`

### 🧑‍💼 Vendors / Visitors
- `GET /api/vendors`
- `GET /api/visitors`

### 💻 Tech Stack & Website Templates
- `GET /api/tech`
- `GET /api/editor`

### 📑 Employee Agreements
- `GET /api/employee-agreements`

### 📈 Events
- `GET /api/events`

### 🔒 Access Logs
- `GET /api/access`
- `GET /api/logs/:path`

---

## ❗ Error Handling

All errors are handled by a global middleware:
- Client errors return status codes like `400`, `401`, or `404`
- Server errors default to `500` with stack trace in development

Example JSON response:
```json
{
  "message": "Invalid token",
  "status": 401
}
```

---

## 📄 License

This project is licensed under the **ISC License**.
