# Task Management System

A full-stack task management application built with MERN stack (MongoDB/PostgreSQL, Express.js, React, Node.js) with Firebase storage, JWT authentication, and real-time updates.

## Features

- 🔐 JWT Authentication & Authorization (Admin/User roles)
- ✅ CRUD operations for Tasks and Users
- 📎 File upload support (PDF, up to 3 per task)
- 📊 Dashboard with charts and statistics
- 🔍 Filter, sort, and pagination for tasks
- 📱 Responsive UI with Tailwind CSS
- 🐳 Docker containerization
- 📚 API documentation with Swagger
- 🧪 Unit and integration tests

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL (Neon Database)
- Firebase Storage
- JWT for authentication
- Multer for file uploads
- Socket.io for real-time updates

### Frontend
- React 18
- Redux Toolkit for state management
- React Router v6
- Tailwind CSS
- Recharts for analytics
- Axios for API calls

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Neon or local)
- Firebase account for storage
- Docker (optional)

## Installation
## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Go to Dashboard and get your credentials:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

### 1. Clone the repository
```bash
git clone https://github.com/adimadhubani/task_management.git
cd task-management-system