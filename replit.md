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
The application uses PostgreSQL with the following main entities:
- **Users**: Authentication, profile information, and travel preferences.
- **Trips**: Travel plans with destinations, dates, budgets, and shared costs.
- **Trip Participants**: Many-to-many relationship between users and trips.
- **Messages**: Real-time chat functionality for travel groups.
- **Trip Requests**: Request system for joining trips.
- **Activities**: Tourist activities with ratings, proposals, and integration into travel plans.
- **Cities**: Centralized city data with geographical classification.

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

### Data Flow
1. **User Registration/Login**: Users authenticate, sessions stored in PostgreSQL.
2. **Trip Creation**: Authenticated users create detailed travel plans.
3. **Trip Discovery**: Users search and filter trips based on preferences.
4. **Participation Requests**: Users request to join trips, creators approve/reject.
5. **Communication**: Approved participants can chat within trip groups.
6. **Cost Sharing**: Trip creators define shared expenses, participants coordinate payments.

## External Dependencies

### Core Dependencies
- **postgres**: PostgreSQL driver.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **passport & passport-local**: Authentication middleware.
- **@tanstack/react-query**: Server state management.
- **react-hook-form**: Form handling with validation.
- **zod**: Schema validation library.
- **date-fns**: Date manipulation and formatting.

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **lucide-react**: Icon library.
- **class-variance-authority**: Component variant management.

### Development Dependencies
- **vite**: Build tool and development server.
- **typescript**: Type safety.
- **tsx**: TypeScript execution for development.