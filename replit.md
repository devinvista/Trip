# ViajaJunto - Travel Companion Platform

## Overview

ViajaJunto is a web-based platform that connects travelers with common interests, destinations, and dates to share travel experiences and costs. Built as a full-stack application using modern web technologies, it enables users to create travel plans, find compatible travel companions, and coordinate shared expenses like accommodation, transportation, and activities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: Express sessions with PostgreSQL store
- **Password Security**: Node.js crypto module with scrypt hashing
- **API Design**: RESTful endpoints with JSON responses
- **Database**: PostgreSQL with Drizzle ORM

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Authentication, profile information, and travel preferences
- **Trips**: Travel plans with destinations, dates, budgets, and shared costs
- **Trip Participants**: Many-to-many relationship between users and trips
- **Messages**: Real-time chat functionality for trip groups
- **Trip Requests**: Request system for joining trips

## Key Components

### Authentication System
- Local authentication with username/password
- Session-based authentication using express-session
- Password hashing using Node.js scrypt with salt
- Protected routes on both frontend and backend
- User profile management with travel preferences

### Trip Management
- Trip creation with detailed planning (destination, dates, budget, style)
- Trip discovery with advanced filtering capabilities
- Participant management with request/approval system
- Real-time messaging within trip groups
- Shared cost tracking for various expense categories
- Expense splitting system similar to Splitwise
  - Add expenses with description, amount, and category
  - Split costs among selected participants
  - Automatic balance calculation
  - Settlement suggestions
  - Receipt upload support

### User Interface
- Responsive design with mobile-first approach
- Component-based architecture using Radix UI primitives
- Dark/light theme support through CSS variables
- Form validation with real-time feedback
- Loading states and error handling throughout the application

### Real-time Features
- Chat system with message polling (3-second intervals)
- Live trip participant updates
- Request notifications and status updates

## Data Flow

1. **User Registration/Login**: Users authenticate through the local strategy, sessions are stored in PostgreSQL
2. **Trip Creation**: Authenticated users create trips with detailed planning information
3. **Trip Discovery**: Users search and filter trips based on preferences and compatibility
4. **Join Requests**: Users request to join trips, creators approve/reject requests
5. **Communication**: Approved participants can chat within trip groups
6. **Cost Sharing**: Trip creators define shared expenses, participants coordinate payments

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **passport & passport-local**: Authentication middleware
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation library
- **date-fns**: Date manipulation and formatting

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives (dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
- Frontend: Vite builds React application to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single deployment artifact with static file serving

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session secret for authentication security
- Neon PostgreSQL as the production database

### Development Setup
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production build
- `npm run start`: Runs production server
- `npm run db:push`: Syncs database schema with Drizzle

## User Preferences

Preferred communication style: Simple, everyday language.
Interface language: Portuguese (all UI elements translated from English to Portuguese).

## Changelog

Changelog:
- June 30, 2025. Initial setup
- July 5, 2025. Fixed authentication session management with proper cookie configuration
- July 5, 2025. Implemented budget subdivision system - budget now represents total trip cost with automatic per-person calculation
- July 5, 2025. Enhanced trip detail page with chat functionality and improved user interface
- July 5, 2025. Added comprehensive expense category breakdown (transport, accommodation, food, activities, etc.)
- July 5, 2025. Created new dynamic home page with featured destinations, trip highlights, and attractive design elements
- July 5, 2025. Added cookie-parser middleware and simplified authentication flow for better session persistence
- July 5, 2025. Removed CORS middleware in favor of native Express session handling
- July 5, 2025. Changed home page to be publicly accessible - no authentication required for initial page
- July 5, 2025. Fixed authentication and login flow - password hashing now uses consistent scrypt method
- July 5, 2025. Fixed route navigation - all dashboard links now point to correct routes (/create-trip, /search)
- July 5, 2025. Trip creators are automatically added as participants with 'accepted' status
- July 5, 2025. Updated session configuration - httpOnly set to false for development, using session store
- July 5, 2025. Fixed trip detail page functionality - added missing API route for individual trip details
- July 5, 2025. Fixed trip card links to use correct route pattern (/trip/:id)
- July 5, 2025. Improved search page with proper filters and API integration
- July 5, 2025. Implemented interactive trip budget visualization with progress bars, pie charts, and budget tips
- July 5, 2025. Migrated successfully from Replit Agent to standard Replit environment
- July 5, 2025. Implemented simplified chat system as mural with message exchange between participants
- July 5, 2025. Fixed session authentication issues by correcting cookie configuration and middleware order
- July 5, 2025. Created default test trips for user Tom: Chapada Diamantina adventure and Campos do Jordão weekend
- July 5, 2025. Enhanced chat window with message composition area, character counter, and proper message display
- July 5, 2025. Successfully migrated from Replit Agent to standard Replit environment with proper security practices
- July 5, 2025. Added animated journey progress tracker with milestone celebrations, point system, and category-based progress visualization
- July 5, 2025. Implemented collaborative trip planning with real-time group editing using WebSocket connections
- July 5, 2025. Added presence indicators, live cursors, and conflict resolution for simultaneous trip editing
- July 5, 2025. Created comprehensive collaborative editing demo page with technical documentation
- July 6, 2025. Translated entire interface to Portuguese - all UI text, form labels, buttons, error messages, and navigation
- July 6, 2025. Implemented expense splitting system similar to Splitwise - participants can add expenses, split costs, track balances, and see settlement suggestions
- July 11, 2025. Successfully migrated from Replit Agent to standard Replit environment with enhanced authentication system
- July 11, 2025. Fixed authentication issues by implementing hybrid session management - supports both cookie-based and header-based session authentication for browser compatibility
- July 11, 2025. Added manual session ID authentication as fallback when browser cookies are blocked - session IDs stored in localStorage and sent via X-Session-ID header
- July 11, 2025. Fixed "Viagens que Estou Participando" section by correctly filtering out trips where user is the creator - now shows only trips where user is a participant but not the creator
- July 11, 2025. Enhanced test data with second test user (maria/demo123) and trip participation examples for better testing of all platform features
- July 11, 2025. Completely redesigned dashboard with modern, dynamic interface featuring gradient backgrounds, colorful stat cards, interactive filters, and improved user experience
- July 11, 2025. Added comprehensive error handling with toast notifications, debug logging, and graceful error states throughout the dashboard
- July 11, 2025. Implemented responsive design improvements for mobile and tablet devices with flexible layouts and better component organization
- July 11, 2025. Enhanced trip statistics calculation with real-time data processing for upcoming, in-progress, and completed trips with visual progress indicators
- July 11, 2025. Implemented "Desistir da Viagem" (quit trip) functionality - participants can leave trips with automatic organizer transfer to first participant if creator leaves
- July 11, 2025. Added backend API endpoint DELETE /api/trips/:id/participants/:userId for removing participants with proper permission checks and automatic trip management
- July 11, 2025. Enhanced storage interface with removeTripParticipant method that handles organizer transfer and automatic trip cancellation when no participants remain
- July 11, 2025. Added confirmation dialog in trip detail page for participants to leave trips with clear warnings and user feedback
- July 11, 2025. Fixed trip join request API endpoint - removed incorrect Zod schema validation for tripId (comes from URL params, not request body) and added duplicate request prevention
- July 11, 2025. Updated travel styles to match popular agency categories: Praia, Neve, Cruzeiros, Natureza e Ecoturismo, Culturais e Históricas, Aventura, Parques Temáticos - updated all components, forms, and test data
- July 11, 2025. Added "Viagens Urbanas / Cidades Grandes" travel style - updated create trip form, search filters, travel board, trip cards, and test user data (Tom changed to urbanas style)
- July 11, 2025. Removed collaborative editing functionality - deleted WebSocket connections, real-time editing components, and all related APIs for simplified architecture
- July 11, 2025. Completely redesigned create trip page with modern gamified interface using React DnD Kit for drag/drop functionality
- July 11, 2025. Implemented travel planning roadmap based on best practices: Research & Inspiration, Budget Planning, Dates & Duration, Group Formation, Logistics & Details
- July 11, 2025. Added interactive activities management with drag/drop prioritization, add/remove functionality, and real-time progress tracking
- July 11, 2025. Enhanced UX with Framer Motion animations, confetti celebrations, achievement system, and responsive gradient backgrounds
- July 11, 2025. Integrated comprehensive travel planning tips and roadmap guidance following industry best practices for trip organization