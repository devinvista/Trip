# Comprehensive Snake_Case Migration Plan

## Current Progress
✓ Database schema already fully snake_case (PostgreSQL)
✓ Shared schema types (User, Trip, etc.) fully snake_case
✓ Authentication system adapted for snake_case
✓ Storage layer fixed for snake_case compatibility
✓ New snake_case auth hook created

## Next Steps

### 1. Frontend Components Migration
- [ ] Update all auth imports to use-auth-snake
- [ ] Convert all component prop naming to snake_case
- [ ] Update form field names and validation schemas
- [ ] Convert API request/response handling to snake_case

### 2. API Routes Migration  
- [ ] Convert all route handlers to snake_case parameter names
- [ ] Update query parameter handling
- [ ] Fix request/response data transformation
- [ ] Update middleware functions

### 3. React Hooks & Utilities Migration
- [ ] Update useAuth hook consumers
- [ ] Convert all query keys to snake_case
- [ ] Update form hooks and validation
- [ ] Fix utility functions

### 4. Pages Migration
- [ ] Update all page components to snake_case props
- [ ] Fix routing parameter handling
- [ ] Convert component state management

### 5. Testing & Validation
- [ ] Test login functionality with demo users
- [ ] Verify all API endpoints work correctly
- [ ] Test trip creation and management
- [ ] Validate activity and review systems

## Key Changes Made
1. Created use-auth-snake.tsx with full snake_case naming
2. Fixed storage.ts TypeScript errors for snake_case compatibility  
3. Updated App.tsx to use snake_case AuthProvider
4. Converted critical backend routes to snake_case handling
5. Maintained database consistency throughout migration