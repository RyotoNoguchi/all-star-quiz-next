# All Star Quiz

A thrilling survival quiz game inspired by Japanese variety shows like "All Star Thanksgiving Festival." The app supports real-time multiplayer quiz gameplay where participants compete in elimination-style questions until only one winner remains.

## 🎯 Game Features

- **⏱️ 10-Second Time Limit**: Quick thinking required for each question
- **🎯 Multiple Choice**: Choose from A, B, C, or D options
- **⚡ Elimination Style**: Wrong answers or timeouts eliminate players
- **🏆 Last Player Wins**: Survive all questions to claim victory
- **🔔 Final Question**: Special bell sound indicates the final round

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build           # Production build
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors automatically
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without changes
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Run tests with coverage report
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **Testing**: Vitest + Testing Library
- **Development**: Turbopack for fast HMR
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Layout components
│   ├── game/              # Quiz-specific components
│   └── __tests__/         # Component tests
├── lib/                   # Utility functions
├── styles/                # Global CSS and Tailwind
└── test/                  # Test setup and utilities
```

## 🎮 Game Components

### Layout System
- `MainLayout`: Basic page wrapper with gradient background
- `GameLayout`: Quiz-specific layout with game styling and optional header

### Game Components
- `QuizButton`: Multi-choice button (A/B/C/D) with selection states and result feedback
- `CountdownTimer`: 10-second countdown with progress bar and urgent state styling

## 🔮 Planned Features

1. **✅ Project Foundation** - Next.js 15 + TypeScript + UI components
2. **🔄 Database & Backend** - Prisma schema + tRPC + NextAuth.js
3. **🔄 Real-time Communication** - Socket.io integration
4. **🔄 Game Logic** - Question management + elimination logic
5. **🔄 Admin Panel** - Game control interface
6. **🔄 Audio & Effects** - Sound system + animations

## 📋 Development Notes

### Component Guidelines
- All React components use arrow function syntax
- Props type always named `Props`
- One component per file (except shadcn/ui)
- Use `type` instead of `interface`

### Testing
- Component tests in `src/components/__tests__/`
- Focus on user interactions and state changes
- Vitest + Testing Library setup

## 📄 License

This project is private and proprietary.

---

🚧 **Development Status**: Foundation phase complete. Multiplayer backend, question system, and real-time features coming soon!