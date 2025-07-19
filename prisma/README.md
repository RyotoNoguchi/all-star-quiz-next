# All Star Quiz Database Schema

This document describes the PostgreSQL database schema for the All Star Quiz application, designed to support real-time multiplayer quiz games with elimination mechanics.

## Overview

The schema is built with Prisma ORM and PostgreSQL, optimized for the specific requirements of the All Star Quiz game mechanics:

- **Real-time multiplayer support** with elimination logic
- **Precise timing tracking** for answer responses (critical for eliminations)
- **NextAuth.js integration** for authentication
- **Comprehensive game statistics** and analytics
- **Admin tools** for question and game management

## Core Models

### User Management

#### `User`
- **Purpose**: Player and admin accounts
- **Key Features**: 
  - Role-based access (PLAYER, ADMIN, SUPER_ADMIN)
  - Game statistics tracking (games played, won, total score)
  - NextAuth.js integration

#### `Account`, `Session`, `VerificationToken`
- **Purpose**: NextAuth.js required models for OAuth and session management

### Question System

#### `Question`
- **Purpose**: Quiz questions with multiple choice answers
- **Key Features**:
  - Question types: NORMAL (elimination) vs FINAL (fastest wins)
  - Difficulty levels: EASY, MEDIUM, HARD
  - Four options (A, B, C, D) with correct answer tracking
  - Categorization and tagging system
  - Usage tracking and active/inactive status

### Game Management

#### `GameSession`
- **Purpose**: Individual quiz game instances
- **Key Features**:
  - 6-digit join codes for easy access
  - Game status tracking (WAITING → STARTING → IN_PROGRESS → FINISHED)
  - Configurable settings (max players, time limits)
  - Admin controls and winner tracking

#### `GameParticipant`
- **Purpose**: Player participation in specific games
- **Key Features**:
  - Participant status (ACTIVE, ELIMINATED, WINNER)
  - Performance metrics (score, correct/incorrect answers)
  - Timing statistics (average, fastest, slowest response times)
  - Elimination tracking (when and why eliminated)

### Answer Tracking

#### `GameQuestion`
- **Purpose**: Questions used in specific game sessions
- **Key Features**:
  - Question order and timing within games
  - Aggregate statistics per question
  - Response time analytics

#### `PlayerAnswer`
- **Purpose**: Individual player responses with precise timing
- **Key Features**:
  - Selected answer (A, B, C, D) or timeout
  - **Critical timing data**: Response time in seconds, exact timestamp
  - Elimination logic support (wrong answer, timeout, slowest correct)
  - Correctness tracking

### Analytics

#### `GameStatistics`
- **Purpose**: Comprehensive game analytics and reporting
- **Key Features**:
  - Game duration and performance metrics
  - Answer distribution analysis
  - Elimination reason tracking
  - Question difficulty analysis

#### `SystemSettings`
- **Purpose**: Global system configuration
- **Key Features**:
  - Default game parameters
  - Rate limiting settings
  - System-wide feature flags

## Game Logic Implementation

### Elimination Mechanics

The schema supports All Star Quiz's unique elimination rules:

1. **Wrong Answer Elimination**: `PlayerAnswer.isCorrect = false` → immediate elimination
2. **Timeout Elimination**: `PlayerAnswer.isTimeout = true` → immediate elimination
3. **Slowest Correct Elimination**: Among correct answers, highest `responseTime` → elimination
4. **Final Question**: Fastest correct answer wins (lowest `responseTime`)

### Timing Precision

Critical for elimination logic:
- `PlayerAnswer.responseTime`: Float in seconds (e.g., 3.247 seconds)
- `PlayerAnswer.answeredAt`: Exact timestamp when answer was submitted
- `GameQuestion.startedAt/endedAt`: Question timing boundaries

### Performance Optimization

Key indexes for real-time performance:
- `PlayerAnswer`: `(gameId, questionId)`, `(isCorrect, responseTime)`
- `GameParticipant`: `(gameId, status)` for active player queries
- `GameSession`: `(code)` for fast game joins, `(status)` for game filtering

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production-ready)
npm run db:migrate

# Deploy migrations (production)
npm run db:deploy

# Open Prisma Studio (visual database browser)
npm run db:studio

# Seed database with sample data
npm run db:seed

# Reset database (⚠️ destructive)
npm run db:reset
```

## Environment Setup

Required environment variables:

```env
# Primary database connection
DATABASE_URL="postgresql://username:password@localhost:5432/all_star_quiz"

# NextAuth.js configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Sample Data

The seed script (`prisma/seed.ts`) creates:
- System configuration with default settings
- Admin user account for testing
- Sample questions covering various difficulty levels and categories
- Example final question for game-ending scenarios

## Real-time Considerations

This schema is designed to work with Socket.io for real-time features:

- **Game state synchronization**: `GameSession.status` changes broadcast to all participants
- **Live answer tracking**: `PlayerAnswer` records enable real-time elimination updates
- **Timer synchronization**: `GameQuestion.startedAt` provides authoritative timing

## Security Features

- **Role-based access control** via `User.role`
- **Game code uniqueness** enforced on `GameSession.code`
- **Participant validation** through `GameParticipant` relationship
- **Admin isolation** via `GameSession.adminId` ownership

## Next Steps

1. **Database Setup**: Configure PostgreSQL and run initial migration
2. **Prisma Integration**: Generate client and integrate with tRPC
3. **Authentication**: Configure NextAuth.js with chosen providers
4. **Real-time Layer**: Implement Socket.io with this schema
5. **Admin Interface**: Build game management tools using these models