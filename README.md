# 🎯 Talent Hunt

## 🧾 Introduction

**Talent Hunt** is a comprehensive online platform designed to connect students, mentors, and administrators through competitions. It offers tools for managing contests, forming teams, tracking progress, and aligning activities with Sustainable Development Goals (SDGs). The built-in Teammate Finder enhances collaborative learning and problem-solving.

## 📚 Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
  - [Admin Features](#admin-features)
  - [Mentor Features](#mentor-features)
  - [Student Features](#student-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Screenshots](#-screenshots)
- [Demo Video](#-examples)
- [Contributors](#-contributors)

## 🚀 Features

### 👤 Admin Features

- Review all registered students and mentors.
- Track progress and competition success rates.
- View and manage team details for each applicant.
- Post, edit, and delete competitions with specific requirements.
- Accept or reject applications submitted for competitions.
- Delete user accounts (students or mentors) as needed.
- View and export detailed platform reports (PDF + print support).
- Monitor growth metrics for users and overall platform performance.

### ✍️ Mentor Features

- View all assigned teams, their progress, and team members.
- Track development status of teams and individuals.
- Add, edit, or delete tasks for each team.
- View complete details of all team members.
- Access detailed reports on team and individual progress.
- Maintain an editable profile section.

### 🧑‍🎓 Student Features

- Edit personal profiles and track individual goals.
- Map their teams to SDGs and view a personalized SDG dashboard.
- View competition details and join via existing teams.
- Request mentorship and explore mentor profiles.
- Track application status and receive updates.
- Access team overviews and application history.
- Connect with other students and send/accept invites to join teams.
- Post openings for teams and manage applicants.
- View all created and joined teams, manage members, mentors, and team tasks.
- Perform full SDG mapping and analysis for teams.
- Analyze skills, competition history, and personal growth with exportable (PDF/print) reports.
- Built-in chat system for team communication with members and mentors.

## 🧑‍💻 Tech Stack

- **Frontend**:
  - React.js
  - Tailwind CSS
  - Axios
  - React Router DOM

- **Backend**:
  - Node.js + Express.js
  - MongoDB Atlas

- **Authentication**:
  - Firebase Authentication

- **Utilities**:
  - React Toastify
  - React Icons

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Vashni14/talent-hunt.git
cd talent-hunt
```

### 2. Setup Frontend

```bash
npm install
npm start
# Runs the frontend on: http://localhost:5173
```

### 3. Setup Backend

```bash
cd backend
npm install
node server.js
# Runs the backend on: http://localhost:5000 (or as configured)
```

## 📦 Usage

Admins: Oversee competitions, manage users, monitor performance, and approve teams.

Mentors: Guide teams, assign tasks, evaluate progress, and access reports.

Students: Form teams, map SDGs, join contests, invite members, request mentorship, and track personal development.

## ⚙️ Configuration

Create a `.env` file in the backend directory with:

```env
MONGODB_URI=your_mongodb_atlas_uri
PORT=your_port_number
```
Update the firebase.json file in the root directory with:
```env
REACT_APP_API_URL=your_backend_api_url
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
REACT_APP_FIREBASE_APP_ID=your_app_id
````

Replace placeholders with your actual credentials.

## 🖼️ Screenshots

Get an overview of our features here:https://drive.google.com/file/d/1zSA_RAzxJlaRRxypXidZcfgKa_S-MRw2/view?usp=sharing

## 💡 Demo Video

Take a glimpse of our full demo website video here:https://drive.google.com/file/d/12Ah2mQpz0TSmulN1L7WhPuIvYH1xsY7l/view?usp=drive_link

## 👥 Contributors

- Vashni14
- amrita022
- hrudaypatil21
