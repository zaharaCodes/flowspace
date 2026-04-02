# Flowspace — Real-Time Project Dashboard

A full-stack agency project management dashboard with role-based access, live WebSocket activity feeds, and real-time notifications.

![Flowspace Dashboard](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20Socket.io-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![TypeScript](https://img.shields.io/badge/TypeScript-Full%20Stack-3178C6)

## Features

- **Role-based access** — Admin, Project Manager, Developer with strictly different permissions enforced at API level
- **Real-time activity feed** — WebSocket powered, role-filtered, with missed event catchup
- **Live notifications** — In-app bell with badge, real-time count via WebSocket
- **Kanban board** — Drag-style task view for Project Managers
- **Task management** — Status workflow, priority levels, due date warnings
- **Team page** — Member cards with task counts and progress bars
- **Background jobs** — node-cron auto-flags overdue tasks every hour
- **Docker** — One command setup

## Quick Start

### Prerequisites
- Docker Desktop

### Run locally
```bash
git clone https://github.com/zaharaCodes/flowspace.git
cd flowspace
docker compose up --build
```

App runs at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Seed the database
```bash
docker exec -it agency_server sh -c "cd /app && npx ts-node prisma/seed.ts"
```

### Test credentials (password: password123)

| Name | Email | Role |
|------|-------|------|
| Fathima Zahra | fathima@flowspace.com | Admin |
| Zahara Sheikh | zahara@flowspace.com | Admin |
| Arjun Sharma | arjun@flowspace.com | Project Manager |
| Priya Nair | priya@flowspace.com | Project Manager |
| Ravi Kumar | ravi@flowspace.com | Developer |
| Aisha Patel | aisha@flowspace.com | Developer |
| Rohan Mehta | rohan@flowspace.com | Developer |
| Sneha Reddy | sneha@flowspace.com | Developer |

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Real-time | Socket.io WebSockets |
| Auth | JWT (access token + HttpOnly refresh cookie) |
| Jobs | node-cron |
| Validation | Zod |
| Infrastructure | Docker, Docker Compose |

## Database Schema

7 tables: `User`, `Client`, `Project`, `Task`, `ActivityLog`, `Notification`, `RefreshToken`

### Indexing decisions
- `Task` — indexed on `projectId`, `assignedTo`, `status`, `dueDate`, `priority` (all filter columns)
- `ActivityLog` — indexed on `projectId`, `userId`, `createdAt` (feed queries filter by these)
- `Notification` — indexed on `userId` + `isRead` (unread count query)
- `RefreshToken` — indexed on `token` (lookup) and `userId` (cleanup on logout)

## Architectural Decisions

### WebSocket: Socket.io
Chosen over native WebSocket for built-in room management, automatic reconnection, and JWT middleware support. Room-per-project model (`project:{id}`) allows targeted broadcasts without sending updates to unrelated users.

### Role-filtered real-time feed
On each emit, the server iterates over all sockets in a project room and performs a per-socket authorization check before sending — Admin gets everything, PM gets only their projects, Developer gets only their assigned tasks.

### Missed events on reconnect
Client stores last-seen timestamp in localStorage. On reconnect, fetches last 20 ActivityLog entries from DB filtered by timestamp and role scope — no in-memory caching needed.

### node-cron over Bull queue
Simple hourly schedule with no retry or distributed worker needs. Bull adds Redis dependency unnecessarily for this use case.

### Token storage
Access token in localStorage (15min TTL). Refresh token in HttpOnly cookie — inaccessible to JavaScript, protected against XSS.

## Known Limitations
- No file attachments on tasks
- WebSocket presence resets on server restart (no Redis pub/sub)
- No email notifications — in-app only
- No project deletion UI (API supported)

## Keyboard Shortcuts
- `D` — Go to Dashboard
- `P` — Go to Projects
- `T` — Go to Team
- `Esc` — Close any modal
