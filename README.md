📌 Task Manager

A full-stack task management application with:

Backend: Flask + Supabase + JWT Auth

Frontend: React + Vite + TailwindCSS + Redux Toolkit

Database: Supabase (Postgres)

🚀 Project Structure
task-manager/
├── backend/      # Flask API
│   ├── app.py
│   ├── requirements.txt
│   └── ...
├── frontend/     # React App
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md

🛠️ Setup Instructions
1️⃣ Backend (Flask API)

Go to backend folder:

cd backend


Create a virtual environment and install dependencies:

python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows PowerShell
pip install -r requirements.txt


Configure environment (config.py or .env):

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret


Run the backend:

python app.py


API will run on: http://127.0.0.1:5000

2️⃣ Frontend (React + Vite)

Go to frontend folder:

cd frontend


Install dependencies:

npm install


Create .env file:

VITE_API_URL=http://127.0.0.1:5000


Run frontend:

npm run dev


Frontend will run on: http://localhost:5173

🔄 Branching Workflow

This repo follows a 3-branch strategy:

main → Production (only README.md, clean branch)

staging → Pre-production/testing branch (only README.md)

dev → Active development branch (all code lives here)

Workflow:

Developers work on dev.

Once features are stable → merge dev → staging.

After testing in staging → merge staging → main.

✅ Features

🔑 JWT Authentication with Supabase

📝 Create, Read, Update, Delete (CRUD) tasks

📊 Task statuses: To Do, In Progress, Completed

🎨 Responsive UI with TailwindCSS

🗂️ Redux Toolkit for state management

👨‍💻 Developer Setup Checklist

 Clone repo and checkout dev branch

 Setup backend environment and Supabase

 Setup frontend environment with .env

 Commit to dev branch only

 Create Pull Request when ready to merge

📜 License

MIT License
