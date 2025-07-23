# TradeTrackr Client

A modern Next.js application for managing clients, jobs, and invoices with authentication, built with TypeScript, Tailwind CSS, and Radix UI components.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with responsive design and dark mode
- **UI Components**: Radix UI, Shadcn UI, Lucide React, Heroicons
- **Authentication**: Auth0
- **Forms & Validation**: Zod for runtime type validation
- **Testing**: Jest (unit/integration), Playwright (e2e)
- **Build Tools**: PostCSS, ESLint

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with auth and navigation
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── middleware.ts            # Auth middleware
│   │
│   ├── clients/                 # Client management feature
│   │   ├── page.tsx            # Clients list page
│   │   ├── error.tsx           # Error boundary
│   │   ├── components/         # Client-specific components
│   │   └── types/              # Client TypeScript interfaces
│   │
│   ├── jobs/                    # Job management feature
│   │   ├── page.tsx            # Jobs list page
│   │   ├── error.tsx           # Error boundary
│   │   ├── components/         # Job-specific components
│   │   └── types/              # Job TypeScript interfaces
│   │
│   ├── invoices/                # Invoice management feature
│   │   ├── page.tsx            # Invoices list page
│   │   ├── error.tsx           # Error boundary
│   │   ├── components/         # Invoice-specific components
│   │   └── types/              # Invoice TypeScript interfaces
│   │
│   ├── dashboard/               # Analytics dashboard
│   │   └── page.tsx            # Dashboard with summary widgets
│   │
│   ├── components/              # Shared UI components
│   │   ├── NavMenu.tsx         # Main navigation
│   │   └── ui/                 # Reusable UI primitives
│   │
│   ├── helpers/                 # Utility functions
│   │   ├── authRequest.ts      # Authenticated API requests
│   │   └── getLabel.tsx        # Label formatting utilities
│   │
│   └── lib/                     # Core libraries
│       ├── actions.ts          # Server actions for CRUD operations
│       ├── auth0.ts            # Auth0 configuration
│       └── utils.ts            # General utilities
│
├── e2e/                         # End-to-end tests
├── coverage/                    # Test coverage reports
└── test-results/               # Playwright test results
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API server running (see backend documentation)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tradetrackr.client

# Install dependencies
npm install

# Set up environment variables
cp .env.local
# Edit .env.local with your configuration
```

### Environment Variables

```bash
# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=tradetrackr-url
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# API Configuration
API_BASE_URL=api-url
```

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm run test           # Unit and integration tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run playwright     # E2E tests
npm run playwright:open # E2E tests with UI

# Build for production
npm run build
npm start
```

## Architecture Overview

### App Router Structure

The application uses Next.js 14 App Router with a feature-based organization:

- **Server Components**: Used by default for data fetching and static content
- **Client Components**: Used for interactivity
- **Server Actions**: Handle form submissions and data mutations
- **Error Boundaries**: Consistent error handling across routes

### Authentication Flow

1. **Auth0 Integration**: Handles user authentication and session management
2. **Middleware Protection**: `middleware.ts` protects authenticated routes
3. **Token Management**: Access tokens stored in HTTP-only cookies
4. **API Requests**: `authRequest.ts` helper adds authentication headers

### Data Flow

```
Browser ↔ Next.js Client ↔ Server Actions ↔ Backend API ↔ Database
```

- **Client Components**: Handle user interactions and form state
- **Server Actions**: Execute on server, handle API calls and revalidation
- **API Integration**: RESTful endpoints with authenticated requests
- **State Management**: React state for client-side, server components for data

## Features & Components

### Dashboard (`/dashboard`)

**Purpose**: Business overview with key metrics and recent activity

**Components**:

- Summary cards (clients, jobs, invoices, outstanding balance)
- Recent activity feed with chronological updates
- Responsive grid layout with gradient backgrounds

### Client Management (`/clients`)

**Purpose**: CRUD operations for customer management

**Key Components**:

- `ClientsListClient`: Main client list with search and pagination
- `ClientForm`: Create/edit client form with validation
- `ClientDetails`: Modal view for client information

### Job Management (`/jobs`)

**Purpose**: Track work projects with status management

**Key Components**:

- `JobsListClient`: Job list with filtering and status indicators
- `JobForm`: Comprehensive form for job details
- `JobDetails`: Detailed job view modal

### Invoice Management (`/invoices`)

**Purpose**: Generate and track project invoices

**Key Components**:

- `InvoicesListClient`: Invoice list with status tracking
- `InvoiceForm`: Invoice creation with client/job selection
- `InvoiceDetails`: Comprehensive invoice view

## Testing Strategy

### Unit & Integration Tests (Jest + React Testing Library)

Located in `__tests__` directories within each feature:

### End-to-End Tests (Playwright)

Located in `e2e/` directory:

## Deployment

### Build Process

```bash
# Production build
npm run build

# Start production server
npm start
```

## Contributing

### Development Guidelines

1. **Component Structure**: Follow the established patterns for forms, lists, and actions
2. **TypeScript**: Use strict typing with interfaces and Zod validation
3. **Styling**: Use Tailwind classes consistently, mobile-first approach
4. **Testing**: Write tests for new components and critical user flows
5. **Accessibility**: Ensure ARIA labels and keyboard navigation

### Code Style

- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode enabled with proper type definitions

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit pull request with clear description

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Auth0 Next.js Guide](https://auth0.com/docs/quickstart/webapp/nextjs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
