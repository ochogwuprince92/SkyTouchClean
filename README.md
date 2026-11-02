# SkyTouchClean

**Clean Spaces. Fresh Clothes. Less Worries.**

A full-stack web application for managing professional cleaning, laundry, and fumigation services in Lagos. Built with Next.js, MongoDB, and TypeScript.

## 📋 Overview

SkyTouchClean is a comprehensive service management platform that allows customers to book cleaning services online while providing staff with a powerful admin dashboard for order management. The platform supports three main service types:

- **Home Cleaning** - Professional residential and commercial cleaning
- **Laundry Services** - Expert garment care with per-item pricing
- **Fumigation** - Professional pest control services (quotation-based)

## ✨ Features

### Customer Features
- **Guest Booking** - Book services without account registration
- **Real-time Booking Status** - Track order status via reference number and OTP
- **Online Payments** - Secure payment processing via Paystack
- **Service Catalog** - View pricing for all services
- **Responsive Design** - Works seamlessly on mobile and desktop

### Admin/Staff Features
- **Secure Authentication** - Role-based access (ADMIN/STAFF)
- **Dashboard** - View and manage all bookings
- **Order Management** - Update booking status with state machine validation
- **Price Management** - Configure service pricing dynamically
- **Staff Management** - Invite and manage team members
- **Audit Trail** - Complete history of all status changes
- **Session Management** - Secure server-side sessions with Argon2id hashing

### Security Features
- **Admin-only Operations** - Critical actions restricted to ADMIN role
- **Payment Verification** - Payment status cannot be manually bypassed
- **Data Access Control** - STAFF role has limited access to customer PII
- **Secure Password Reset** - Token-based with session invalidation
- **Anti-Enumeration** - OTP flow prevents email enumeration via timing attacks
- **Price Manipulation Prevention** - Single active price per service/item combination

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Fontsource** - Custom fonts (Pacifico)

### Backend
- **Next.js Route Handlers** - Server-side API endpoints
- **Node.js 20** - Runtime environment
- **MongoDB 7** - NoSQL database
- **Argon2** - Secure password hashing

### Testing
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing
- **Zod** - Runtime validation

### DevOps
- **Docker** - Containerization
- **Jenkins** - CI/CD pipeline
- **Git** - Version control

### Third-party Integrations
- **Paystack** - Payment processing
- **Resend** (optional) - Email delivery

## 📁 Project Structure

```
SkyTouchClean/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── prices/        # Price management
│   │   │   └── login/         # Admin authentication
│   │   ├── api/               # API routes (backend)
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   ├── bookings/      # Booking CRUD
│   │   │   ├── laundry-orders/# Laundry orders
│   │   │   ├── payments/      # Paystack webhooks
│   │   │   └── booking-status/# OTP-based status lookup
│   │   ├── book/              # Customer booking flow
│   │   ├── status/            # Booking status page
│   │   ├── services/          # Service catalog
│   │   ├── pricing/           # Pricing page
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions
│   │   ├── auth/              # Authentication logic
│   │   ├── email/             # Email adapters
│   │   ├── mongodb/          # Database client
│   │   └── middleware.ts      # Auth middleware
│   ├── server/                # Backend repositories
│   │   ├── bookings/          # Booking data access
│   │   ├── laundry-orders/    # Laundry order data access
│   │   ├── services/          # Service data access
│   │   ├── service-prices/    # Price data access
│   │   ├── staff/             # Staff data access
│   │   ├── auth-tokens/       # Token management
│   │   ├── sessions/         # Session management
│   │   └── status-history/    # Audit trail
│   └── types/                 # TypeScript type definitions
├── scripts/                   # Utility scripts
│   ├── seed.ts               # Database seeding
│   └── setup-indexes.ts      # MongoDB index setup
├── e2e/                       # Playwright E2E tests
├── public/                    # Static assets
├── Dockerfile                 # Docker configuration
├── Jenkinsfile               # CI/CD pipeline
├── .dockerignore             # Docker build exclusions
└── docs/                      # Additional documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SkyTouchClean
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/skytouchclean
MONGODB_DB=skytouchclean

# Session
SESSION_SECRET=your-session-secret-at-least-32-characters

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your-secret-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# First Admin (for seed)
ADMIN_EMAIL=admin@skytouchclean.com
ADMIN_PASSWORD=AdminPassword123
ADMIN_NAME=Super Admin

# Email (optional)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your-api-key
```

4. **Set up MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env.local
```

5. **Seed the database**
```bash
npm run seed
```

This creates:
- Services (Home Cleaning, Laundry, Fumigation)
- Service prices
- First admin user

6. **Start the development server**
```bash
npm run dev
```

Visit http://localhost:3000

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking

# Database
npm run setup-indexes  # Create MongoDB indexes
npm run seed           # Seed database with initial data
npm run test-seed      # Test seed data

# Testing
npm test              # Run unit tests (Vitest)
npm run test:e2e      # Run E2E tests (Playwright)
npm run test:e2e:ui   # Run E2E tests with UI
npm run test:e2e:debug # Debug E2E tests
```

## 🔐 Security

The application implements comprehensive security measures:

- **Password Hashing** - Argon2id with secure parameters
- **Session Management** - Server-side sessions with secure cookies
- **Role-Based Access Control** - ADMIN and STAFF roles with different permissions
- **Payment Verification** - Paystack webhooks for secure payment confirmation
- **Input Validation** - Zod schemas for all API inputs
- **SQL Injection Prevention** - MongoDB driver with parameterized queries
- **XSS Protection** - React's built-in escaping
- **CSRF Protection** - Next.js built-in CSRF tokens

See [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) and [SECURITY_FIXES.md](./SECURITY_FIXES.md) for detailed security analysis.

## 🧪 Testing

### Unit Tests
```bash
npm test
```
Runs 62 tests across 5 test files using Vitest.

### E2E Tests
```bash
npm run test:e2e
```
Runs end-to-end tests with Playwright, covering critical user flows.

## 🐳 Docker

Build and run the application with Docker:

```bash
# Build image
docker build -t skytouchclean:latest .

# Run container
docker run -d -p 3000:3000 \
  -e MONGODB_URI="mongodb://your-mongodb:27017/skytouchclean" \
  -e MONGODB_DB="skytouchclean" \
  -e SESSION_SECRET="your-secret" \
  skytouchclean:latest
```

See [DOCKER_JENKINS_SETUP.md](./DOCKER_JENKINS_SETUP.md) for complete Docker documentation.

## 🔄 CI/CD

The project uses Jenkins for continuous integration and deployment:

- **Linting** - Code quality checks
- **Type Checking** - TypeScript validation
- **Unit Tests** - Automated testing
- **E2E Tests** - Full flow testing
- **Docker Build** - Container image creation
- **Deployment** - Automated staging/production deployment

See [Jenkinsfile](./Jenkinsfile) and [DOCKER_JENKINS_SETUP.md](./DOCKER_JENKINS_SETUP.md) for pipeline configuration.

## 📊 Business Rules

### Pricing
- **Laundry** - Priced per garment/item, not by weight
- **Native Wear** - ₦1,500 per item/set
- **Duvets** - From ₦3,500 (staff confirms final price)
- **Home Cleaning** - Monthly packages include four visits
- **Fumigation** - Quotation-only until prices are supplied

### Service Policies
- Laundry pickup and delivery are advertised as free (staff confirms eligibility)
- Cleaning can be labor-only or with materials supplied by SkyTouchClean
- Guest booking is allowed (no customer registration required)
- Admin registration is private (invite-only)

## 📞 Contact

**SkyTouchClean**
- Phone/WhatsApp: 08157278277
- Address: 28 Agberin Street, Close to St Daniel Hospital, Oworo, Lagos
- Tagline: HONESTY AND SERVICE

## 📚 Documentation

- [AGENTS.md](./AGENTS.md) - Development guidelines and conventions
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) - Security analysis
- [SECURITY_FIXES.md](./SECURITY_FIXES.md) - Security fixes applied
- [DOCKER_JENKINS_SETUP.md](./DOCKER_JENKINS_SETUP.md) - Docker and Jenkins setup
- [PHASES_1_2_REPORT.md](./PHASES_1_2_REPORT.md) - Implementation phase 1 & 2 report
- [PHASE_6_REPORT.md](./PHASE_6_REPORT.md) - Implementation phase 6 report
- [LAUNCH_CHECKLIST_AUDIT.md](./LAUNCH_CHECKLIST_AUDIT.md) - Pre-launch checklist
- [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) - Vercel deployment checklist

## 🗺 Roadmap

- [ ] Email notifications for booking updates
- [ ] SMS notifications for status changes
- [ ] Customer account registration
- [ ] Order history for customers
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time status updates (WebSocket)

## 📄 License

Proprietary - All rights reserved to SkyTouchClean.

---

**Built with ❤️ for SkyTouchClean**
