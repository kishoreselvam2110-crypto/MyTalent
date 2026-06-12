# MyTalent
Smart choices for bright futures - An AI-powered internship recommendation engine for the PM Internship Scheme.

## Project Structure
- `frontend/` - Next.js 14 App Router, Tailwind CSS, Shadcn, PWA.
- `backend/` - Node.js Express API, Prisma ORM, PostgreSQL.
- `recommendation-service/` - Python FastAPI microservice running TF-IDF and Cosine Similarity.
- `data/` - Sample CSV data for seeding.

## Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.9+
- PostgreSQL
- Redis

### 1. Database & Cache
Create a PostgreSQL database named `mytalent`.
Ensure Redis is running locally on port 6379.

### 2. Backend
```bash
cd backend
npm install
# Set up .env based on .env.example
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### 3. Recommendation Service (Python)
```bash
cd recommendation-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features Implemented
- PWA Configuration (Offline capability)
- Mock WebOTP auto-login flow (simulated with 123456)
- Framer Motion animations across UI
- Dynamic Career Roadmap
- TF-IDF AI Recommendations
- Application Tracker
- Resume Parsing (Mocked for POC)
