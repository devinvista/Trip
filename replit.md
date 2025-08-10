# PartiuTrip - Plataforma de Companheiros de Viagem

## Overview

PartiuTrip is a web platform designed to connect travelers with shared interests, destinations, and dates to facilitate shared travel experiences and cost-sharing. It enables users to create travel plans, find compatible travel companions, and coordinate shared expenses such as accommodation, transportation, and activities. The project aims to provide a comprehensive solution for collaborative travel planning and expense management.

## User Preferences

Estilo de comunicação preferido: Linguagem simples e cotidiana.
Idioma da interface: Português brasileiro (todos os elementos da UI traduzidos do inglês para português).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for themes
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Storage**: Express sessions with MySQL storage
- **Password Security**: Node.js crypto module with scrypt hashing
- **API Design**: RESTful endpoints with JSON responses
- **Database**: PostgreSQL with Drizzle ORM (fully migrated from MySQL to PostgreSQL)

### Database Schema
The application uses PostgreSQL with consistent snake_case naming throughout all entities:
- **users**: Authentication, profile information, and travel preferences.
- **trips**: Travel plans with destinations, dates, budgets, and shared costs.
- **trip_participants**: Many-to-many relationship between users and trips.
- **messages**: Real-time chat functionality for travel groups.
- **trip_requests**: Request system for joining trips.
- **activities**: Tourist activities with ratings, proposals, and integration into travel plans.
- **destinations**: Centralized city data with geographical classification.
- **expenses**: Shared expense tracking with detailed splits.
- **user_ratings**: Peer review system for travel companions.
- **activity_reviews**: TripAdvisor-style activity reviews and ratings.

### Core Components and Features
- **Authentication System**: Local authentication, session-based management, scrypt password hashing, protected routes, user profile management.
- **Review System**: 1-5 star ratings for tourist activities, full interface with forms, photo uploads, visit dates, comments, "helpful" voting, verification badges, and integration with activity details.
- **Trip Management**: Creation of detailed travel plans, advanced filtering for trip discovery, participant management (request/approval), real-time messaging within groups, shared cost tracking (similar to Splitwise), expense splitting with automatic balance calculation and settlement suggestions.
- **User Interface**: Responsive design (mobile-first), component-based architecture using Radix UI primitives, dark/light theme support, real-time form validation, loading states, and error handling.
- **Real-time Features**: Chat system with polling, live updates for trip participants, and notifications for requests and status changes.
- **Performance Optimizations**: Memoized components, lazy loading, virtual scrolling, error boundaries, custom hooks (useDebounce, useLocalStorage), optimized image loading, and a comprehensive notification center.
- **Budgeting System**: Detailed budget categorization (accommodation, transport, food, activities), automatic budget updates based on added activities, and a streamlined budget visualization.
- **Gamification**: Includes traveler levels and a "PartiuAmigos" program.
- **Localization**: All UI elements are translated to Brazilian Portuguese.

### Data Flow (Full snake_case Implementation)
1. **user_authentication**: Users authenticate with snake_case credentials, sessions stored in PostgreSQL.
2. **trip_creation**: Authenticated users create detailed travel plans with snake_case field names.
3. **trip_discovery**: Users search and filter trips using snake_case query parameters.
4. **participation_requests**: Users request to join trips, creators approve/reject with snake_case status fields.
5. **real_time_communication**: Approved participants chat using snake_case message properties.
6. **expense_management**: Trip creators define shared expenses with snake_case field structures.

### Recent Changes (August 2025)
- **Complete snake_case Migration**: Full architectural conversion from camelCase to snake_case.
- **Database Consistency**: All database fields, API endpoints, and data structures use snake_case.
- **Frontend Adaptation**: React components and state management converted to snake_case.
- **Authentication Fix**: Login system repaired with correct password hashing for demo users.
- **PostgreSQL Integration**: Successfully migrated from MySQL to PostgreSQL with full snake_case schema.
- **Replit Migration**: Successfully migrated from Replit Agent to Replit environment with enhanced security.
- **Database Security Implementation**: Comprehensive security measures to protect against unauthorized database connections.
- **Replit Migration**: Successfully migrated from Replit Agent to Replit environment with enhanced security.
- **Database Security Implementation**: Comprehensive security measures to protect against unauthorized database connections.

### Security Features
- **Database Connection Protection**: Multi-layer validation ensures only authorized Neon PostgreSQL connections.
- **Runtime Monitoring**: Continuous monitoring of database URL integrity and unauthorized access attempts.
- **Request Security Middleware**: Blocks suspicious API requests and logs all database-related activities.
- **Environment Variable Protection**: Monitors and prevents unauthorized changes to critical configuration.
- **Access Control**: Implements strict controls against local databases and Replit native storage.

## External Dependencies

### Core Dependencies
- **postgres**: PostgreSQL driver with snake_case field naming.
- **drizzle-orm**: Type-safe ORM configured for PostgreSQL with snake_case consistency.
- **passport & passport-local**: Authentication middleware with snake_case user properties.
- **@tanstack/react-query**: Server state management maintaining snake_case data flow.
- **react-hook-form**: Form handling with validation using snake_case field names.
- **zod**: Schema validation library with snake_case field validation.
- **date-fns**: Date manipulation and formatting in Portuguese locale.

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **lucide-react**: Icon library.
- **class-variance-authority**: Component variant management.

### Development Dependencies
- **vite**: Build tool and development server.
- **typescript**: Type safety.
- **tsx**: TypeScript execution for development.

### Security Features
- **Database Connection Protection**: Multi-layer validation ensures only authorized Neon PostgreSQL connections.
- **Runtime Monitoring**: Continuous monitoring of database URL integrity and unauthorized access attempts.
- **Request Security Middleware**: Blocks suspicious API requests and logs all database-related activities.
- **Environment Variable Protection**: Monitors and prevents unauthorized changes to critical configuration.
- **Access Control**: Implements strict controls against local databases and Replit native storage.