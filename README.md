# Earnlock App Monorepo

This repository is organized into separate frontend and backend projects.

## Repository layout

- `frontend/` — Expo application code, shared UI, and frontend configuration
- `backend/` — Flask API server and Python backend dependencies
- `docs/` — architecture and tech stack documentation
- `.gitignore` — shared ignore rules for both ecosystems

## Run locally from scratch

### 1. Frontend setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm start
```

The Expo app will launch and provide options for web, Android, and iOS.

### 2. Backend setup

Create and activate a Python virtual environment, then install dependencies:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Start the Flask backend:

```bash
python app.py
```

The backend API will run on `http://localhost:5000`.

### 3. Validate code quality

Frontend validation:

```bash
cd frontend
bun run validate
```

Backend validation:

```bash
cd backend
sh validate.sh
```

## Notes

- The frontend expects API calls to be made to the local backend during development.
- Local runtime files are ignored in `.gitignore` for both `frontend` and `backend`.

## Branching policy

- Always branch off `main`.
- Use feature branches in the form `feature/your-task-name`.
- Open a Pull Request to merge changes back into `main`.
- Do not push directly to `main`.
