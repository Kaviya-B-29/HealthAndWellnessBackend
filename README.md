# Health & Wellness App - Backend
=================================

This repository contains the backend implementation of the Health & Wellness Tracking System.  
It provides a secure RESTful API built with Node.js, Express.js, and MongoDB.  
The backend handles authentication, data storage, and business logic for workouts, nutrition, mental health logs, and goals.

------------------
## System Features
------------------
- User authentication and authorization (JWT-based)
- CRUD operations for:
  - Workouts
  - Nutrition (Food logs)
  - Mental Health logs
  - Goals
- Secure password hashing
- Centralized error handling
- MongoDB Atlas integration


## Project Structure
HealthAppBackend/
├── models/ # Mongoose models for MongoDB collections
│ ├── User.js
│ ├── Workout.js
│ ├── Food.js
│ ├── MentalLog.js
│ └── Goal.js
├── routes/ # Express route handlers
│ ├── authRoutes.js
│ ├── workoutRoutes.js
│ ├── foodRoutes.js
│ ├── mentalRoutes.js
│ └── goalRoutes.js
├── middleware/ # Middleware for auth and error handling
│ └── authMiddleware.js
├── controllers/ # logic for each feature
│ ├── authController.js
│ ├── workoutController.js
│ ├── foodController.js
│ ├── mentalController.js
│ └── goalController.js
├── config/ # Database and environment configuration
│ └── db.js
├── server.js # Entry point for Express server
├── package.json # Dependencies and scripts
└── .env # environment configuration

API Overview
--------------

POST /api/auth/register – Register a new user

POST /api/auth/login – Login and receive token

GET /api/auth/me – Get logged in user details

GET/POST/DELETE /api/workouts – Manage workout logs

GET/POST/DELETE /api/foods – Manage nutrition logs

GET/POST/DELETE /api/mental-logs – Manage mental health logs

GET/POST/DELETE /api/goals – Manage goals
