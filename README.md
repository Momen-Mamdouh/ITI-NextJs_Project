# MERN E-Commerce Platform (Next.js)

## Overview

A scalable, production-grade multi-vendor e-commerce platform built with a modern MERN architecture using Next.js App Router. The system supports multiple roles (Customer, Seller, Admin), secure payments, and modular feature-based architecture.

---

## Tech Stack

### Frontend

- Next.js 16.2.4 (App Router)
- React (aligned with Next.js)
- Tailwind CSS 4.2.2
- shadcn/ui 0.9.5
- Redux Toolkit 2.11.2

### Backend

- Node.js (LTS)
- Express.js (modular services)
- MongoDB (latest stable)
- Mongoose (ODM)

---

## Architecture

- Feature-based structure
- Server Components by default
- Client Components only when required
- Modular backend services
- Role-Based Access Control (RBAC)

---

## Project Structure

```
src/
  app/
  features/
    admin/
      components/
      services/
      store/
    seller/
      components/
      services/
      store/
    payment/
      components/
      services/
  shared/
    components/
    ui/
    hooks/
    utils/
    types/
  lib/
  store/
```

---

## Features

### Core System (Context)

- User Management (Auth, Roles, Profiles)
- Product Management (Categories, Listings, Filtering)
- Cart & Checkout
- Order Management

### Some Phases Scope

#### Payment Integration

- Stripe integration
- Secure payment intents
- Webhook handling
- Extensible payment service layer

#### Admin Panel

- User management (approve/restrict, soft delete)
- Product & category management
- Order & shipping control
- Role-based access system

#### Seller System

- Seller onboarding & profiles
- Product & inventory management
- Ownership validation
- Multi-vendor architecture

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- MongoDB
- npm or yarn

---

### Installation

```
git clone https://github.com/<Momen-Mamdouh>/ITI-NextJs_Project.git
cd ITI-NextJs_Project
npm install
```

---

### Environment Variables

Create `.env.local`:

```
DATABASE_URL=
NEXT_PUBLIC_API_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

### Run Development

```
npm run dev
```

---

## Scripts

```
npm run dev       # start development
npm run build     # production build
npm run start     # start production server
npm run lint      # lint code
```

---

## Git Workflow

### Branches

- main → production
- develop → integration

### Naming

- feature/<name>
- fix/<name>
- hotfix/<name>

### Rules

- No direct push to main or develop
- All changes via Pull Requests
- At least one approval required

---

## CI/CD

### Continuous Integration

- Runs on pull requests and develop branch
- Lint + build checks

### Continuous Deployment

- Auto deployment on main branch
- Preview deployments for pull requests

---

## Code Standards

- TypeScript strict mode
- No comments inside code
- SOLID principles
- Reusable components
- No duplication

---

## Security

- Environment variables for secrets
- No sensitive data in client
- Input validation
- Protection against XSS, CSRF, injection

---

## Contribution Guide

1. Create a feature branch from develop
2. Implement changes
3. Commit using conventional commits
4. Open Pull Request to develop
5. Request review
6. Merge after approval

---

## License

MIT
