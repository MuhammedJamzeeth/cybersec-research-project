# CyberSafe - Gamified Cybersecurity Awareness Platform

A Next.js 16 application that gamifies cybersecurity awareness through interactive assessments across five key topics.

## Features

- 🔐 **Authentication System**: User registration, login, and session management
- 📚 **5 Cybersecurity Topics**: 
  - Password Management
  - Social Media Privacy
  - Safe Browsing
  - Phishing Awareness
  - Mobile App Permissions (powered by FastAPI microservice with ML)
- 📝 **Interactive Assessments**: Knowledge tests with immediate feedback
- 🤖 **ML-Powered Assessments**: Mobile App Permissions uses trained ML model for scoring
- 🎯 **Personalized Feedback**: Context-aware explanations based on user demographics
- 📊 **Progress Tracking**: Monitor scores and completion status
- 🎨 **Modern UI**: Built with Tailwind CSS v4 and shadcn/ui components
- 🌙 **Dark Mode Support**: Automatic theme switching

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Custom JWT-based auth with bcryptjs
- **Package Manager**: pnpm
- **Microservices**: FastAPI for Mobile App Permissions assessment (Python)

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (recommended) or npm
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository and install dependencies:**

```bash
# Install dependencies
pnpm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB connection string:

```
MONGO_URI=mongodb://localhost:27017/gamification
PORT=3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Mobile App Permissions FastAPI Service (optional)
NEXT_PUBLIC_APPPERM_API_URL=http://localhost:8000
```

> **Note**: The Mobile App Permissions assessment uses a separate FastAPI microservice. See [ModelAppPer Setup](#mobile-app-permissions-microservice) below.

3. **Set up the database:**

```bash
# Generate Prisma Client
pnpm exec prisma generate

# Push schema to MongoDB (creates collections)
pnpm exec prisma db push
```

4. **Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Other Commands

```bash
# Build for production
pnpm build

# Run production server
pnpm start

# Lint code
pnpm lint

# Open Prisma Studio (database GUI)
pnpm exec prisma studio
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Home page with category cards
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── about/             # About page
│   ├── profile/           # User profile and progress
│   ├── categories/[slug]/ # Dynamic category assessment pages
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       │   ├── login/     # POST /api/auth/login
│       │   ├── register/  # POST /api/auth/register
│       │   └── user/      # GET /api/auth/user
│       └── assessments/   # Assessment endpoints
│           ├── route.ts   # GET/POST /api/assessments
│           └── [slug]/    # GET /api/assessments/:slug
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── Header.tsx        # Navigation header
│   ├── Footer.tsx        # Site footer
│   └── CategoryCard.tsx  # Topic card component
├── lib/                   # Utilities
│   ├── utils.ts          # Helper functions
│   ├── auth.tsx          # Authentication context
│   ├── prisma.ts         # Prisma client instance
│   └── questions.ts      # Assessment questions data
└── types/                 # TypeScript definitions
    └── index.ts          # Shared type interfaces
prisma/
└── schema.prisma         # Prisma schema (User, Assessment models)
```

## How It Works

1. **Browse Topics**: View 5 cybersecurity topics on the home page
2. **Authenticate**: Click a topic card to be prompted to login/register
3. **Take Assessment**: Complete a 5-question knowledge test for the selected topic
4. **Get Results**: Receive immediate feedback with your score and answer review
5. **Track Progress**: View all completed assessments in your profile

## Database Schema

### User Model
```prisma
model User {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  username    String       @unique
  email       String       @unique
  password    String       // Hashed with bcryptjs
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  assessments Assessment[]
}
```

### Assessment Model
```prisma
model Assessment {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  categoryId  String
  slug        String
  answers     Int[]    // Array of selected answer indices
  score       Int      // Percentage score (0-100)
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/user?userId={id}` - Get user by ID

### Assessments
- `GET /api/assessments?userId={id}` - Get all assessments for a user
- `POST /api/assessments` - Save a new assessment
- `GET /api/assessments/{slug}?userId={id}` - Check if user completed a specific category

## Authentication

The app uses a custom authentication system with:
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Session Management**: Client-side session storage with localStorage
- **API Authentication**: RESTful API endpoints for login/register
- **Database**: MongoDB for persistent user data

For production deployment, consider adding:
- JWT tokens for stateless authentication
- HTTP-only cookies for secure token storage
- Refresh token mechanism
- OAuth providers (Google, GitHub, etc.)

## Data Storage

The application uses **MongoDB** with **Prisma ORM** for data persistence:
- User accounts and authentication
- Assessment results and scores
- Progress tracking across categories

### Local Development
Run MongoDB locally or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Production
Use MongoDB Atlas (free tier available):
1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGO_URI` in `.env`

## Mobile App Permissions Microservice

The **Mobile App Permissions** assessment uses a separate FastAPI microservice with ML-based scoring and personalized feedback.

### Quick Setup

```bash
# Navigate to the ModelAppPer directory
cd ../ModelAppPer

# Run the start script (Windows)
.\start.ps1

# Or manually:
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

The FastAPI service will run on http://localhost:8000

### Features

- 🤖 **ML-Based Scoring**: Trained model for answer evaluation
- 👤 **Personalized Explanations**: Feedback based on user demographics
- 📊 **Advanced Analytics**: Detailed performance metrics
- 🔄 **RESTful API**: Easy integration with any frontend

### Documentation

See the ModelAppPer directory for complete documentation:
- `README.md` - Complete API documentation
- `QUICKSTART.md` - Quick start guide
- `INTEGRATION.md` - Integration guide with Next.js
- `CHECKLIST.md` - Implementation checklist

### Testing

Visit http://localhost:8000/docs for interactive API documentation and testing.

## Development Notes

- All pages are Server Components by default except where client interactivity is needed
- Client Components use `"use client"` directive
- Path aliases use `@/*` for imports from `src/`
- Tailwind CSS v4 uses new `@theme inline` syntax
- Dark mode uses CSS media query approach

## AI Coding Instructions

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for detailed AI agent guidance on:
- Project architecture and conventions
- Component patterns
- Development workflows
- Implementation strategies

## Future Enhancements

- [ ] Database integration (Prisma + PostgreSQL)
- [ ] More detailed gamification elements (badges, leaderboards)
- [ ] Additional cybersecurity topics
- [ ] Timed assessments
- [ ] Certificate generation
- [ ] Admin dashboard for managing questions

## License

MIT
