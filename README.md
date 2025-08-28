# School Management Application

A comprehensive CRUD-based School Management System with a modern admin dashboard interface.

## Features

- **Student Management**: Add, view, update, and delete student records
- **Course Management**: Manage courses with codes, titles, and credits
- **Enrollment System**: Track student enrollments in courses
- **Admin Authentication**: Secure login/logout system
- **Modern Dashboard**: Clean, responsive interface with statistics and quick actions
- **Real-time Statistics**: Live counts of students, courses, and enrollments

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Authentication**: Session-based with bcrypt
- **Styling**: Custom CSS with modern design

## Project Structure

```
SCHOOLproject/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── students.js
│   │   ├── courses.js
│   │   └── enrollments.js
│   └── index.html
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── courses.js
│   │   └── enrollments.js
│   ├── middleware/
│   │   └── auth.js
│   ├── database/
│   │   └── db.js
│   └── server.js
├── db/
│   └── school.db
├── package.json
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd SCHOOLproject
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Initialize the database**

   ```bash
   node backend/database/init-db.js
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Default admin credentials:
     - Username: `admin`
     - Password: `admin123`

## Deployment

### GitHub Pages (Frontend Only)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose `main` branch and `/frontend` folder
   - Save the settings

### Render Deployment (Full Stack)

1. **Create a Render account**

   - Sign up at [render.com](https://render.com)

2. **Connect your GitHub repository**

   - Click "New +" and select "Web Service"
   - Connect your GitHub account
   - Select your repository

3. **Configure the deployment**

   - **Name**: `school-management-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (root of repo)

4. **Environment Variables** (if needed)

   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render's default)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application

### Heroku Deployment

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**

   ```bash
   heroku login
   ```

3. **Create Heroku app**

   ```bash
   heroku create your-app-name
   ```

4. **Add buildpack for Node.js**

   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Open the app**
   ```bash
   heroku open
   ```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status

### Students

- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollments

- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Create new enrollment
- `PUT /api/enrollments/:id` - Update enrollment
- `DELETE /api/enrollments/:id` - Delete enrollment

## Database Schema

### Students Table

- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `age` (INTEGER NOT NULL)
- `class` (TEXT NOT NULL)
- `email` (TEXT UNIQUE)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### Courses Table

- `id` (INTEGER PRIMARY KEY)
- `code` (TEXT UNIQUE NOT NULL)
- `title` (TEXT NOT NULL)
- `credits` (INTEGER NOT NULL)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### Enrollments Table

- `id` (INTEGER PRIMARY KEY)
- `student_id` (INTEGER NOT NULL)
- `course_id` (INTEGER NOT NULL)
- `enrollment_date` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- FOREIGN KEY (student_id) REFERENCES students(id)
- FOREIGN KEY (course_id) REFERENCES courses(id)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@schoolmanagement.com or create an issue in the GitHub repository.
