# enroll-js

EAV (Entity-Attribute-Value) entity management service built with Hono and Drizzle ORM on Node.js/TypeScript.

## Prerequisites

- Node.js >= 18
- PostgreSQL

## Environment Variables

Copy the example env file and modify the values to match your environment:

```bash
cp .env.example .env
```

Then edit `.env` and set your database connection:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/enroll
PORT=3100
```

| Variable        | Description              | Default  |
|-----------------|--------------------------|----------|
| `DATABASE_URL`  | PostgreSQL connection string | required |
| `PORT`          | Server listen port       | `3100`   |

## Install

```bash
npm install
```

## Database Setup

Generate and push the schema to your PostgreSQL database:

```bash
# Generate migration files
npm run db:generate

# Apply schema to database
npm run db:push

# (Optional) Open Drizzle Studio to browse data
npm run db:studio
```

## Run

```bash
# Development (hot reload)
npm run dev

# Production build + start
npm run build
npm start
```

The server starts at `http://localhost:3100` by default.

## API Endpoints

| Method | Path                  | Description                         |
|--------|-----------------------|-------------------------------------|
| GET    | `/health`             | Health check (verifies DB connection) |
| GET    | `/api/entities`       | List all EAV entities               |
| GET    | `/api/entities/:id`   | Get a single entity by ID           |
| GET    | `/api/rooms/report`   | Preview room generation report      |
| POST   | `/api/rooms/generate` | Generate missing rooms              |

## Test

This project does not yet have a test suite configured. Contributions welcome.

## Tech Stack

- **Hono** - Lightweight web framework
- **Drizzle ORM** - Type-safe PostgreSQL ORM
- **TypeScript** - Type-safe JavaScript
- **postgres.js** - PostgreSQL driver
