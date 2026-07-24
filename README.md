# Full-Stack AI Medical Diagnosis Assistant

A monorepo for a full-stack AI-powered medical diagnosis assistant.

## Architecture

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Zustand, React Query
- **Backend**: FastAPI, SQLAlchemy, Celery, XGBoost, PyTorch
- **Databases**: PostgreSQL (relational), MongoDB (images), Redis (cache/queue)
- **ML**: XGBoost (Symptom prediction), ResNet-50 (Image classification)

## Project Structure

- `/backend` - FastAPI application
- `/frontend` - Next.js application
- `/ml` - Jupyter notebooks and ML experimentation
- `/data` - Local dataset storage (ignored in version control)

## Setup

1. Make sure you have Docker and Docker Compose installed.
2. Clone this repository.
3. Start the services:
   ```bash
   docker-compose up -d
   ```
4. Access the frontend at `http://localhost:3000`
5. Access the backend API docs at `http://localhost:8000/docs`
