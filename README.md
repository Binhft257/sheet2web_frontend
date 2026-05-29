# Sheet2Web

Sheet2Web is a Next.js frontend for turning public Google Sheets into publishable web views. It provides authentication screens, owner workspaces, Google Sheets data-source management, view creation and publishing flows, public view rendering, viewer dashboards, share-token access, and basic admin pages.

## Table of Contents

- [About The Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Current Features](#current-features)
- [System Flow](#system-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running The Project](#running-the-project)
- [Usage](#usage)
- [Frontend Routes](#frontend-routes)
- [API Proxy Routes](#api-proxy-routes)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Future Updates](#future-updates)
- [Notes](#notes)

## About The Project

This project is a frontend application built with Next.js, React, and TypeScript. It connects to the Sheet2Web NestJS backend through Next.js route handlers, uses NextAuth for credential-based authentication, and gives owners a workspace for managing Google Sheets data sources and publishing spreadsheet-backed views.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- NextAuth 5 beta
- TanStack React Query
- Axios
- Zod
- Tailwind CSS 4
- ESLint 9 with Next.js config

## Current Features

- Sign in, sign up, account verification, activation-code retry, and forgot-password screen.
- Credential login through NextAuth and backend JWT storage in the session.
- Owner workspace with dashboard, data-source listing, data-source creation, editing, deletion, sheet listing, and preview support.
- View creation wizard for selecting a data source, sheet, range, display options, access mode, and publish settings.
- Owner view listing, view details, publish controls, permission management, and share-token management.
- Public published view access by slug through `/v/:slug`.
- Share-token access through `/token/:token`.
- Viewer workspace with dashboard, accessible views, and shared views.
- Admin shell with dashboard, users, views, and settings pages.
- Next.js API proxy routes that forward frontend requests to the backend API configured by `API_URL`.
- Shared UI components for page headers, empty states, status badges, dialogs, layout shells, and workspace navigation.

## System Flow

### Authentication Flow

1. A user opens the sign-in or sign-up page.
2. Registration requests are sent through Next.js API routes to the backend.
3. The backend sends an activation code by email.
4. The user verifies the activation code from the verification page.
5. The user logs in with email and password.
6. NextAuth calls the backend `/api/auth/login` endpoint.
7. The backend returns a JWT access token.
8. NextAuth stores the access token in the session.
9. Frontend API proxy routes send the token to protected backend endpoints.

### Sheet-to-Web Flow

1. An owner signs in and enters the owner workspace.
2. The owner creates a data source from a public Google Sheet URL.
3. The frontend sends the request to the backend through `/api/data-sources`.
4. The owner opens the data-source sheets modal or preview flow.
5. The owner creates a view from a selected source sheet or range.
6. The owner publishes the view.
7. The backend stores the published snapshot.
8. Public users can open the published view at `/v/:slug`.
9. Private or shared views can be opened by authenticated viewers or valid share tokens.

## Getting Started

### Prerequisites

- Node.js compatible with Next.js 16
- npm
- Running Sheet2Web backend API

### Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
AUTH_SECRET=your_nextauth_secret
API_URL=http://localhost:3000
```

Notes:

- `AUTH_SECRET` is required by NextAuth.
- `API_URL` must point to the backend server base URL, without the `/api` suffix.
- For the default backend setup, `API_URL=http://localhost:3000` means frontend proxy routes call backend endpoints such as `http://localhost:3000/api/auth/login`.

## Running The Project

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start
```

Open the development app at:

```txt
http://localhost:3000
```

If the backend also runs on port `3000`, run either the frontend or backend on a different port.

## Usage

The frontend uses Next.js pages for user navigation and Next.js route handlers as a backend proxy layer.

Typical local setup:

```txt
Frontend: http://localhost:3001
Backend:  http://localhost:3000/api
API_URL:  http://localhost:3000
```

### Login

Open:

```txt
/sign-in
```

The sign-in form authenticates through NextAuth and the backend login endpoint.

### Owner Workspace

Open:

```txt
/owner/dashboard
```

Owners can manage data sources, create views, publish views, manage permissions, and create share tokens.

### Public View

Open a published view by slug:

```txt
/v/:slug
```

Open a shared view by token:

```txt
/token/:token
```

## Frontend Routes

### Public

| Route                   | Description                    |
| ----------------------- | ------------------------------ |
| `/`                     | Root entry page                |
| `/sign-in`              | Sign-in page                   |
| `/sign-up`              | Registration page              |
| `/forgot-password`      | Forgot-password page           |
| `/verify/:id`           | Activation-code verification   |
| `/v/:slug`              | Public published view          |
| `/token/:token`         | Shared view token access       |

### Owner

| Route                         | Description                  |
| ----------------------------- | ---------------------------- |
| `/owner/dashboard`            | Owner dashboard              |
| `/owner/data-sources`         | Data-source management       |
| `/owner/data-sources/new`     | Data-source creation page    |
| `/owner/data-sources/:sourceId` | Data-source detail page    |
| `/owner/views`                | View management              |
| `/owner/views/new`            | View creation wizard         |
| `/owner/views/:viewId`        | View detail page             |
| `/owner/permissions`          | Permission management page   |
| `/owner/settings`             | Owner settings page          |

### Viewer

| Route                      | Description                    |
| -------------------------- | ------------------------------ |
| `/viewer`                  | Viewer workspace entry         |
| `/viewer/dashboard`        | Viewer dashboard               |
| `/viewer/accessible-views` | Accessible views list          |
| `/viewer/shared`           | Shared views page              |
| `/viewer/access-denied`    | Access denied state            |
| `/viewer/unavailable`      | Unavailable view state         |

### Admin

| Route             | Description       |
| ----------------- | ----------------- |
| `/admin/dashboard` | Admin dashboard  |
| `/admin/users`    | User management   |
| `/admin/views`    | View management   |
| `/admin/settings` | Admin settings    |

## API Proxy Routes

These routes are implemented in `src/app/api` and proxy requests to the backend configured by `API_URL`.

### Auth

| Method | Endpoint                 | Description                       |
| ------ | ------------------------ | --------------------------------- |
| POST   | `/api/auth/register`     | Register a user                   |
| POST   | `/api/auth/check-code`   | Verify activation code            |
| POST   | `/api/auth/retry-active` | Request a new activation code     |
| GET    | `/api/auth/profile`      | Get current authenticated profile |
| *      | `/api/auth/[...nextauth]` | NextAuth route handler           |

### Data Sources

| Method | Endpoint                        | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/api/data-sources`             | List current user's data sources         |
| POST   | `/api/data-sources`             | Create a Google Sheets data source       |
| PATCH  | `/api/data-sources/:id`         | Update a data source                     |
| DELETE | `/api/data-sources/:id`         | Delete a data source                     |
| GET    | `/api/data-sources/:id/sheets`  | List sheets for a data source            |
| POST   | `/api/data-sources/:id/preview` | Preview values from a source sheet/range |

### Views

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| GET    | `/api/views`                          | List views                  |
| POST   | `/api/views`                          | Create a view               |
| GET    | `/api/views/my`                       | List current user's views   |
| GET    | `/api/views/:id`                      | Get a view by ID            |
| PATCH  | `/api/views/:id`                      | Update a view               |
| DELETE | `/api/views/:id`                      | Delete a view               |
| POST   | `/api/views/:id/publish`              | Publish a view              |
| PATCH  | `/api/views/:id/published`            | Update published settings   |
| GET    | `/api/views/:id/permissions`          | List permissions            |
| POST   | `/api/views/:id/permissions`          | Grant permission            |
| GET    | `/api/views/:id/share-tokens`         | List share tokens           |
| POST   | `/api/views/:id/share-tokens`         | Create share token          |

### Viewer and Public Views

| Method | Endpoint                | Description                                 |
| ------ | ----------------------- | ------------------------------------------- |
| GET    | `/api/v/:slug`          | Read a published view by slug               |
| GET    | `/api/viewer/dashboard` | Get viewer dashboard data                   |
| GET    | `/api/viewer/views`     | List views accessible to the current viewer |

## Project Structure

```txt
src/
|-- app/                  # Next.js App Router pages and API route handlers
|-- components/           # Reusable UI and feature components
|-- hooks/                # React Query hooks for owner and viewer features
|-- services/             # Client service wrappers for API calls
|-- types/                # Shared TypeScript types
`-- middleware.ts         # Route middleware
```

Key areas under `src/app/`:

- `(public)`: sign-in, sign-up, verification, public views, and token access.
- `(owner)`: owner workspace pages for dashboard, data sources, views, permissions, and settings.
- `(viewer)`: viewer workspace pages for dashboards and accessible/shared views.
- `(admin)`: admin shell pages.
- `api`: route handlers that proxy frontend requests to the backend.

Key component areas under `src/components/`:

- `auth`: authentication forms and activation retry modal.
- `owner`: owner dashboard, data-source, permission, and view components.
- `viewer`: public and authenticated viewer UI.
- `layouts`: admin and viewer layout shells.
- `common`: shared UI primitives used across pages.
- `providers`: React Query and auth-expiration providers.

## Scripts

| Script          | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the Next.js dev server   |
| `npm run build` | Build the Next.js application  |
| `npm run start` | Start the production server    |
| `npm run lint`  | Run ESLint                     |

## Future Updates

- Add complete admin data integration for users, views, and settings.
- Add password reset backend integration.
- Improve role-based route protection for owner, viewer, and admin areas.
- Add loading skeletons and error recovery states across all workspace pages.
- Add automated tests for authentication, route guards, data-source flows, view publishing, and viewer access.
- Add Docker and CI setup matching the backend project.
- Add deployment documentation for Vercel or another hosting provider.

## Notes

- The frontend depends on the Sheet2Web backend API.
- `API_URL` must be configured before using any proxy route that talks to the backend.
- Backend protected routes require a valid JWT from the NextAuth session.
- Public Google Sheets must be readable by the backend Google Sheets API integration.
- The frontend currently uses API proxy routes instead of calling the backend directly from browser components.
- No Swagger endpoint or generated client is included in the frontend repository.
