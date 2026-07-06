# Architecture Overview

## Project Structure

- `frontend/`
  - Expo-powered React Native application
  - Contains UI, navigation, and presentation logic
  - Hosts the app entrypoint and configuration files (`app.json`, `package.json`, `tsconfig.json`)

- `backend/`
  - Flask-based API server
  - Provides JSON endpoints for frontend integration
  - Uses `Flask-CORS` for secure local development requests from the app

- `docs/`
  - Documentation hub for architecture, tech stack, and design assets

## Proposed Architecture

1. Expo frontend runs independently in development mode.
2. Flask backend serves API requests at `http://localhost:5000`.
3. `Flask-CORS` allows the frontend to communicate with backend endpoints during local testing.
4. Shared data flows through JSON REST endpoints.

## Key Components

- `frontend/app.tsx` and router screens
- `backend/app.py`
- `frontend/src/components/` reusable UI components
- `frontend/scripts/` utility and maintenance scripts

## Local Development Workflow

1. Install frontend dependencies with `npm install` inside `frontend/`.
2. Install backend dependencies with `python -m pip install -r backend/requirements.txt`.
3. Run the frontend using `npm start` from `frontend/`.
4. Run the backend using `python backend/app.py`.
5. Use `localhost` endpoints for local integration.
