# TaskManager

A full-stack task management web app where users can register, log in, and manage their own tasks: create, edit, prioritize, schedule, complete, restore, and delete them. Built with a **React 19 + Vite** frontend and a **TypeScript / Express 5** REST API backed by **PostgreSQL** through the **Prisma ORM**. It uses stateless **JWT authentication** and is deployed on **Railway**.

---

## Features

**Authentication & accounts**
- Register and log in with email and password. Passwords are hashed with **bcrypt**.
- Stateless sessions use short-lived (15 min) **JSON Web Tokens**.
- Client-side **protected routes** send unauthenticated users to the login page.
- A global **Axios response interceptor** spots expired or invalid tokens (401/403), clears the session, and sends the user back to login.
- Account settings let users change their email, change their password, log out, and delete their account. Every sensitive action asks for the current password again.

**Task management**
- Full CRUD on tasks: title, description, priority (low / medium / high), and an optional due date.
- Mark a task complete or incomplete with **optimistic UI updates**. If the server request fails, the change is rolled back.
- Search tasks by title or description and filter by **All / Active / Completed**.
- Edit tasks inline, and confirm before deleting.

**Dashboard**
- A greeting based on the time of day.
- Stat cards for **Total**, **In Progress**, **Completed**, and **Overdue** tasks.
- A **Today's Tasks** list that shows incomplete tasks first.

**Completed archive**
- A dedicated page for finished tasks, with the most recently completed first.
- Search, **restore** (mark incomplete), or permanently delete each task.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, Vite, React Router v7, Axios, Lucide icons, plain CSS |
| Backend    | Node.js, Express 5, TypeScript (strict mode) |
| Database   | PostgreSQL, Prisma ORM 7 (with the `@prisma/adapter-pg` driver adapter), Prisma Migrate |
| Auth       | JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing |
| Validation | `express-validator` |
| Tooling    | ESLint, `tsx` (dev hot reload), `tsc` |
| Deployment | Railway |

---

## Architecture

```mermaid
flowchart LR
    subgraph Client["React SPA (Vite)"]
        R[React Router<br/>+ ProtectedRoute] --> P[Pages<br/>Dashboard · Tasks · Completed · Settings]
        P --> A[Axios client<br/>+ 401/403 interceptor]
    end

    subgraph Server["Express 5 API (TypeScript)"]
        M1[CORS + JSON parser] --> M2[express-validator]
        M2 --> M3[JWT auth middleware]
        M3 --> RT[Routes<br/>/users · /tasks]
        RT --> EH[Central error handler]
    end

    A -- "HTTPS + Bearer token" --> M1
    RT -- Prisma Client --> DB[(PostgreSQL)]
```

**Request flow:** the client keeps the JWT in `localStorage` and sends it as an `Authorization: Bearer <token>` header. The `authenticateToken` middleware verifies the token and attaches `userId` to the request. Every task query is then **scoped to that `userId`**, so users can only read or change their own data.

### Data model

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  tasks        Task[]
}

model Task {
  id          Int       @id @default(autoincrement())
  userId      Int
  title       String
  description String?
  priority    String    @default("medium")
  completed   Boolean   @default(false)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id])
}
```

The schema has changed over time through versioned **Prisma migrations**. For example, an early `status` field was replaced with `completed` and `priority`.

---

## API Reference

Base URL: `http://localhost:3000` (development)

### Users — `/users`

| Method | Endpoint             | Auth | Description |
|--------|----------------------|:----:|-------------|
| POST   | `/users/register`    |      | Create an account (`email`, `password` ≥ 6 chars). Returns `409` if the email already exists. |
| POST   | `/users/login`       |      | Verify credentials and return `{ token }`. |
| GET    | `/users/me`          | ✅   | Get the current user's profile (password hash excluded). |
| PATCH  | `/users/me/email`    | ✅   | Change email (`newEmail`, `password`). |
| PATCH  | `/users/me/password` | ✅   | Change password (`currentPassword`, `newPassword` ≥ 8 chars). |
| DELETE | `/users/me`          | ✅   | Delete the account and all its tasks in one transaction (`password`). |

### Tasks — `/tasks` (all require auth)

| Method | Endpoint      | Description |
|--------|---------------|-------------|
| GET    | `/tasks`      | List the current user's tasks. |
| GET    | `/tasks/:id`  | Get one task (returns `404` if the task doesn't exist or isn't the user's). |
| POST   | `/tasks`      | Create a task (`title`, optional `description`, `priority`, `dueDate`). |
| PATCH  | `/tasks/:id`  | Partially update any of `title`, `description`, `priority`, `completed`, `dueDate`. |
| DELETE | `/tasks/:id`  | Delete a task. |

---

## Engineering Highlights

These are design decisions and problems solved while building the project:

- **Ownership checks inside the query.** Updates and deletes use `updateMany` / `deleteMany` with `where: { id, userId }` instead of looking a task up by `id` alone. A user can't change another user's task by guessing its ID (an IDOR vulnerability), and the check costs no extra round trip.
- **Partial updates with Prisma semantics.** The PATCH endpoint relies on how Prisma treats `undefined` (leave the field alone) versus `null` (clear it). That lets one endpoint handle partial edits *and* explicitly clearing a due date.
- **Atomic account deletion.** Deleting an account removes the user's tasks and then the user inside a single `prisma.$transaction`. The database never ends up with orphaned tasks or a half-deleted account, and the code doesn't depend on a database-level cascade rule.
- **Re-authentication for sensitive actions.** Changing the email or password, or deleting the account, requires the current password even though the user already holds a valid JWT.
- **No user enumeration on login.** A wrong email and a wrong password return the same `401 Invalid email or password` response.
- **Timezone-safe due dates.** Date-only values stored as UTC midnight can display as the previous day in western time zones. The frontend compares and formats dates as `YYYY-MM-DD` calendar strings, so "Due Today" and "Overdue" stay correct in any time zone.
- **Optimistic UI with rollback.** Toggling completion updates the UI right away. If the API call fails, the change is reverted.
- **Central session-expiry handling.** One Axios interceptor handles 401/403 for the whole app, so no page needs its own expiry logic.
- **Layered middleware.** Validation, authentication, and error handling are separate, reusable Express middleware. Unexpected errors pass through `next(error)` to a single handler that returns a generic `500` and doesn't leak internal details.
- **Type safety end to end on the server.** The code uses strict TypeScript with `verbatimModuleSyntax` and NodeNext ESM, plus a Prisma-generated client that types every query.

---

## Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local, Docker, or hosted)

### 1. Clone

```bash
git clone <repo-url>
cd task-manager
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/taskmanager"
JWT_SECRET="replace-with-a-long-random-string"
PORT=3000
```

Run the migrations and start the dev server:

```bash
npx prisma migrate dev     # applies migrations and generates the Prisma client
npm run dev                # tsx watch on http://localhost:3000
```

### 3. Frontend

```bash
cd ../client
npm install
```

Optionally, create `client/.env` (it defaults to `http://localhost:3000`):

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev                # http://localhost:5173
```

### Production build

```bash
# server
npm run build && npm start   # prisma generate + tsc, then node dist/index.js

# client
npm run build                # outputs static assets to client/dist
```

---

## Project Structure

```
task-manager/
├── client/                    # React SPA
│   └── src/
│       ├── api/               # Axios instance, interceptor, auth & task API calls
│       ├── components/        # Sidebar, ProtectedRoute, ...
│       ├── layouts/           # AppLayout (sidebar + routed content)
│       ├── pages/             # Dashboard, Tasks, Completed, Settings, Login, Register
│       ├── stylesheets/       # Per-page CSS
│       ├── App.jsx            # Route definitions (public vs. protected)
│       └── main.jsx
└── server/                    # Express REST API
    ├── prisma/
    │   ├── schema.prisma      # Data model
    │   └── migrations/        # Versioned SQL migrations
    └── src/
        ├── config/db.ts       # Prisma client with the pg driver adapter
        ├── middleware/        # auth (JWT), validation, error handler
        ├── routes/            # user-routes.ts, task-routes.ts
        └── index.ts           # App bootstrap, CORS, route mounting
```

---

## Roadmap

Improvements I'd make next, and how I'd approach them:

- **Refresh tokens in httpOnly cookies.** This would replace `localStorage` tokens, lowering XSS exposure and avoiding a forced logout every 15 minutes.
- **Automated tests:** Jest/Vitest + Supertest for the API and React Testing Library for components, run in CI with GitHub Actions.
- **Stronger validation:** a Prisma `enum` for `priority`, request-body validation on the task routes, and one shared password policy for registration and password changes.
- **Rate limiting** on the auth endpoints to slow down brute-force attempts.
- **Frontend data layer:** move all requests into the shared Axios client and add caching with TanStack Query.
- **Features:** sorting by due date or priority, tags/projects, pagination, and dark mode.
