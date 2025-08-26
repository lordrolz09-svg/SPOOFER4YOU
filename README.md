# SPOOFER4YOU - Premium Spoofing Tools Platform

A modern web application for managing and distributing premium spoofing tools with user authentication, subscription management, and file uploads.

## Features

### Frontend
- **Futuristic Design**: Modern UI with animated backgrounds and gradient effects
- **User Authentication**: Username-based login (max 6 characters)
- **Dashboard**: Clean interface for browsing and downloading files
- **Premium System**: Subscription-based access to downloads
- **Responsive Design**: Works on all devices

### Admin Panel
- **File Management**: Upload .zip, .rar, .exe, .dll, .data, .7z files
- **User Management**: Control user subscriptions (7/30/60/365 days)
- **Category System**: Organize files into categories (SPOOFER4YOU, etc.)
- **Site Customization**: Change site name, icon, and header images
- **Real-time Management**: Add, remove, or modify user access instantly

### Backend
- **Secure API**: JWT-based authentication
- **File Storage**: Secure file upload and download system
- **Database**: SQLite for easy deployment
- **Subscription System**: Automated expiration handling
- **Admin Controls**: Complete user and content management

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT tokens, bcrypt password hashing
- **File Upload**: Multer with size and type validation
- **Deployment**: Docker, Render.com ready

## Quick Start

### Local Development

1. **Clone and setup frontend:**
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

2. **Setup backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Admin Login: username: `admin`, password: `admin123`

### Production Deployment (Render.com)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Deploy on Render.com:**
   - Connect your GitHub repository
   - Use the included `render.yaml` for configuration
   - Or create a new Docker service pointing to your repo

3. **Environment Variables:**
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-secret-key`
   - `PORT=3001` (automatically set by Render)

### Docker Deployment

1. **Build and run:**
   ```bash
   docker build -t spoofer4you .
   docker run -p 3001:3001 spoofer4you
   ```

2. **Or use docker-compose:**
   ```bash
   docker-compose up -d
   ```

## Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

⚠️ **Important**: Change the default admin password in production!

## File Upload Limits

- **Supported formats**: .zip, .rar, .exe, .dll, .data, .7z
- **Maximum file size**: 5GB per file
- **Storage**: Files stored in `/uploads` directory

## Subscription Types

- **7 days**: Weekly access
- **30 days**: Monthly access  
- **60 days**: Bi-monthly access
- **365 days**: Annual access

## API Endpoints

### Public Routes
- `POST /api/login` - User authentication
- `POST /api/verify-token` - Token verification

### User Routes (Authenticated)
- `GET /api/categories` - Get categories and files
- `GET /api/download/:fileId` - Download file (premium only)

### Admin Routes (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/subscription` - Update user subscription
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create new category
- `POST /api/admin/upload` - Upload file
- `DELETE /api/admin/files/:id` - Delete file
- `GET/PUT /api/admin/settings` - Site settings

## Database Schema

### Users
- id, username, password, role, created_at

### Subscriptions  
- id, user_id, type, expires_at, is_active, created_at

### Categories
- id, name, created_at

### Files
- id, filename, original_name, file_path, file_size, category_id, uploaded_at

### Settings
- key, value (for site customization)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- File type validation
- Admin-only routes protection
- Secure file serving
- Input validation and sanitization

## Customization

### Site Branding
- Change site name, icon, and header through admin panel
- Upload PNG/JPEG images for branding
- Customizable categories for different tool types

### User Management
- Add/remove user subscriptions
- Set custom expiration dates
- Monitor user activity
- Role-based access control

## Support

For issues and questions:
1. Check the logs: `docker logs container_name`
2. Verify file permissions in uploads directory
3. Ensure all environment variables are set
4. Check database connectivity

## License

Proprietary - All rights reserved SPOOFER4YOU