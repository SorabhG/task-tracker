# Task Tracker

A learning project built with **Next.js, React, TypeScript, Prisma ORM 8, and PostgreSQL**.

The purpose of this project is to learn how a modern full-stack Next.js application works, gradually moving from a simple React UI to a database-backed application with authentication and authorization.

---

# Tech Stack

* Next.js 16
* React 19
* TypeScript
* Prisma ORM 8 RC
* PostgreSQL
* Docker
* Zod
* bcryptjs

---

# Task Model

A task belongs to a user.

```ts
type Task = {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    userId: string;
};
```

---

# User Model

```ts
type User = {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: string;
};
```

Passwords are never stored directly. The password is hashed using `bcryptjs`.

---

# Session Model

```ts
type Session = {
    id: string;
    userId: string;
    expiresAt: string;
};
```

The browser receives a `sessionId` cookie after login.

The session connects the browser to the authenticated user:

```text
Browser
   │
   │ sessionId cookie
   ▼
Session
   │
   │ userId
   ▼
User
```

---

# Database Architecture

PostgreSQL runs inside Docker.

```text
Next.js
    │
    ▼
Prisma ORM 8
    │
    ▼
PostgreSQL
    │
    ▼
task_tracker
```

Database-related files:

```text
src/
└── prisma/
    ├── contract.prisma
    ├── contract.json
    ├── contract.d.ts
    └── db.ts

prisma.config.ts
.env
.env.example
```

---

# Database Relationships

```text
┌──────────────┐
│     User     │
├──────────────┤
│ id           │
│ email        │
│ passwordHash │
│ createdAt    │
└──────┬───────┘
       │
       │ 1
       │
       │ *
       ▼
┌──────────────┐
│     Task     │
├──────────────┤
│ id           │
│ title        │
│ completed    │
│ createdAt    │
│ userId       │
└──────────────┘

User
  │
  │ 1
  │
  │ *
  ▼
Session
```

`Task.userId` is a foreign key referencing `User.id`.

`Session.userId` is a foreign key referencing `User.id`.

---

# Application Architecture

```text
                    Browser
                       │
                       ▼
                  Next.js App
                       │
             ┌─────────┴─────────┐
             │                   │
          Pages/UI              API
             │                   │
             ▼                   ▼
       React Components      Route Handlers
                                   │
                                   ▼
                             Authentication
                                   │
                                   ▼
                              Current User
                                   │
                                   ▼
                              Authorization
                                   │
                                   ▼
                              Prisma ORM
                                   │
                                   ▼
                              PostgreSQL
```

---

# React UI Architecture

```text
/tasks
   │
   ▼
TasksPage
Server Component
   │
   ▼
TasksClient
Client Component
   │
   ├───────────────┐
   ▼               ▼
AddTaskForm     Task List
Client          Client
```

`TasksClient` manages the task list using React state.

Important React concepts learned:

* Components
* Props
* Functions as props
* `useState`
* `useEffect`
* `map`
* `filter`
* Spread operator
* Client Components
* Server Components
* React re-rendering

---

# API

## GET /api/tasks

Returns tasks belonging to the currently authenticated user.

```text
GET /api/tasks
       │
       ▼
getCurrentUser()
       │
       ▼
Current User
       │
       ▼
WHERE userId = user.id
       │
       ▼
Task[]
```

Unauthenticated request:

```text
401 Not Authenticated
```

---

# POST /api/tasks

Creates a task for the currently authenticated user.

Request:

```json
{
    "title": "Learn React"
}
```

The `userId` is **not supplied by the browser**.

It comes from the authenticated user:

```ts
userId: user.id
```

Example response:

```json
{
    "id": "generated-uuid",
    "title": "Learn React",
    "completed": false,
    "userId": "user-id",
    "createdAt": "..."
}
```

Success:

```text
201 Created
```

Invalid input:

```text
400 Bad Request
```

---

# PATCH /api/tasks/:id

Updates a task.

Request:

```json
{
    "completed": true
}
```

The task must belong to the authenticated user.

Conceptually:

```text
WHERE
    id = requestedTaskId
    AND
    userId = currentUser.id
```

Success:

```text
200 OK
```

If the task cannot be accessed:

```text
404 Not Found
```

---

# DELETE /api/tasks/:id

Deletes a task.

The task must belong to the authenticated user.

Conceptually:

```text
WHERE
    id = requestedTaskId
    AND
    userId = currentUser.id
```

Success:

```text
200 OK
```

If the task cannot be accessed:

```text
404 Not Found
```

---

# Authentication

Authentication answers:

> **Who are you?**

The login flow is:

```text
Browser
   │
   ▼
POST /api/auth/login
   │
   ▼
Find User
   │
   ▼
Compare password
   │
   ▼
Create Session
   │
   ▼
sessionId
   │
   ▼
HTTP Cookie
```

The browser subsequently sends:

```text
Cookie: sessionId=...
```

---

# getCurrentUser()

The application uses `getCurrentUser()` to determine the logged-in user.

```text
sessionId cookie
       │
       ▼
Find Session
       │
       ▼
Get session.userId
       │
       ▼
Find User
       │
       ▼
Current User
```

This allows API routes to know who is making the request.

---

# Authorization

Authorization answers:

> **Are you allowed to perform this action?**

Our task APIs use `user.id` to enforce ownership.

### GET

```ts
.where({ userId: user.id })
.all();
```

Only the user's own tasks are returned.

### POST

```ts
userId: user.id
```

The new task belongs to the authenticated user.

### PATCH

```ts
.where({
    id,
    userId: user.id
})
```

Only the owner can update the task.

### DELETE

```ts
.where({
    id,
    userId: user.id
})
```

Only the owner can delete the task.

---

# Important Security Principle

Never trust the client to tell the server who owns a resource.

For example, we should **not** accept:

```json
{
    "title": "My task",
    "userId": "some-user-id"
}
```

Instead:

```text
Browser
   │
   ▼
Authenticated Session
   │
   ▼
Current User
   │
   ▼
Server determines userId
```

The server is responsible for determining ownership.

---

# Prisma ORM Query Builder

Prisma ORM 8 uses query builders that can be chained.

For example:

```ts
db.orm.public.Task
    .where({ userId: user.id })
    .all();
```

`where()` builds/narrows the query.

`all()` is a terminal operation that executes the query and returns the results.

Therefore:

```ts
await db.orm.public.Task
    .where({ userId: user.id })
    .all();
```

is correct.

---

# Async / Await

`await` is used when an operation returns a Promise.

Examples in this project:

```ts
const user = await getCurrentUser();
```

```ts
const response = await fetch("/api/tasks");
```

```ts
const data = await response.json();
```

```ts
const tasks = await db.orm.public.Task
    .where({ userId: user.id })
    .all();
```

Important distinction:

```ts
.where(...)
```

builds a query.

```ts
.all()
```

executes the query.

Therefore:

```ts
await Task.where(...)
```

does not make sense by itself because `where()` returns a query builder rather than the final Promise containing the results.

---

# Add Task Flow

```text
User
 │
 ▼
AddTaskForm
 │
 ▼
handleAdd()
 │
 ▼
onAdd(title)
 │
 ▼
POST /api/tasks
 │
 ▼
Authentication
 │
 ▼
Current User
 │
 ▼
Server creates task
 │
 ▼
userId = user.id
 │
 ▼
PostgreSQL
 │
 ▼
Returns new Task
 │
 ▼
setTasks([...tasks, data])
 │
 ▼
React re-renders
```

---

# Database Testing with Docker

PostgreSQL container:

```text
task-tracker-postgres
```

Database:

```text
task_tracker
```

User:

```text
taskuser
```

Check application users:

```powershell
docker exec -it task-tracker-postgres psql -U taskuser -d task_tracker -c 'SELECT id, email, "createdAt" FROM "user";'
```

Check tasks:

```powershell
docker exec -it task-tracker-postgres psql -U taskuser -d task_tracker -c 'SELECT id, title, completed, "userId" FROM task;'
```

Check sessions:

```powershell
docker exec -it task-tracker-postgres psql -U taskuser -d task_tracker -c 'SELECT * FROM session;'
```

Check relationships using a JOIN:

```powershell
docker exec -it task-tracker-postgres psql -U taskuser -d task_tracker -c 'SELECT t.title, t.completed, u.email FROM task t JOIN "user" u ON t."userId" = u.id ORDER BY t."createdAt";'
```

List tables:

```powershell
docker exec -it task-tracker-postgres psql -U taskuser -d task_tracker -c "\dt"
```

---

# Current Status

## Completed

* React components
* Props
* Functions as props
* `useState`
* `useEffect`
* `map`
* `filter`
* Spread operator
* Server Components
* Client Components
* GET `/api/tasks`
* POST `/api/tasks`
* PATCH `/api/tasks/:id`
* DELETE `/api/tasks/:id`
* Request/response JSON
* Zod validation
* Server-side validation
* HTTP status codes
* Client-side API error handling
* UUID task IDs
* PostgreSQL
* Docker
* Prisma ORM 8 RC
* Database relationships
* Foreign keys
* User model
* Session model
* Password hashing
* Login
* Session cookies
* `getCurrentUser()`
* Authentication
* Authorization
* Task ownership
* User-specific task filtering
* Protected GET/POST/PATCH/DELETE APIs
* Async/await fundamentals
* Prisma ORM query builders

---

# Phase 8 Completed — Authentication & Authorization

The completed architecture is:

```text
                         Browser
                            │
                 ┌──────────┴──────────┐
                 │                     │
               Login                  Tasks
                 │                     │
                 ▼                     ▼
        /api/auth/login           /api/tasks
                 │                     │
                 ▼                     ▼
             Session            getCurrentUser()
                                       │
                                       ▼
                                 Current User
                                       │
                                       ▼
                                 Authorization
                                       │
                                       ▼
                                  Prisma ORM
                                       │
                                       ▼
                                  PostgreSQL
```

Database:

```text
┌──────────────┐
│     User     │
├──────────────┤
│ id           │
│ email        │
│ passwordHash │
│ createdAt    │
└──────┬───────┘
       │
       ├───────────────────┐
       │                   │
       │ 1                 │ 1
       │                   │
       │ *                 │ *
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│     Task     │    │   Session    │
├──────────────┤    ├──────────────┤
│ id           │    │ id           │
│ title        │    │ userId       │
│ completed    │    │ expiresAt    │
│ createdAt    │    └──────────────┘
│ userId       │
└──────────────┘
```

---

# Next Phase

Continue building the application while learning:

* Improve authentication UX
* Logout
* Protect pages
* Loading states
* Error states
* Authentication-aware UI
* Further Next.js server/client patterns
* Application cleanup and refactoring

## Phase 10 — Multi-page Next.js

### Objective

Learn how to build and navigate between multiple pages using the Next.js App Router.

### Concepts Learned

* **File-system based routing**

  * `app/page.tsx` → `/`
  * `app/about/page.tsx` → `/about`
  * `app/tasks/page.tsx` → `/tasks`

* **Dynamic routes**

  * `app/tasks/[id]/page.tsx` → `/tasks/<id>`
  * `[id]` represents a dynamic URL segment.
  * Example: `/tasks/abc123` provides `id = "abc123"` through `params`.

* **Route parameters**

  * Dynamic route parameters are received through `params`.
  * In the current Next.js App Router:

    ```tsx
    const { id } = await params;
    ```

* **Layouts**

  * `app/layout.tsx` is the root layout.
  * `{children}` represents the page rendered inside the layout.
  * Layouts allow shared UI such as navigation to be defined once.

* **Nested layouts**

  * `app/tasks/layout.tsx` applies to the Tasks section.
  * It is shared by:

    * `/tasks`
    * `/tasks/new`
    * `/tasks/[id]`

* **Static vs dynamic routes**

  * `/tasks/new` uses `tasks/new/page.tsx`.
  * `/tasks/abc123` uses `tasks/[id]/page.tsx`.
  * Static routes take precedence over dynamic routes.

* **Navigation with `Link`**

  * Next.js uses `Link` for internal application navigation:

    ```tsx
    <Link href="/tasks">Tasks</Link>
    ```
  * `Link` enables Next.js client-side navigation.
  * Normal `<a>` elements can also navigate internally, but `Link` is normally preferred for internal Next.js routes.

### Task Tracker Routing Structure

```text
app/
│
├── layout.tsx
├── page.tsx
│
├── about/
│   └── page.tsx
│
├── profile/
│   └── page.tsx
│
└── tasks/
    ├── layout.tsx
    ├── page.tsx
    │
    ├── new/
    │   └── page.tsx
    │
    └── [id]/
        └── page.tsx
```

### Routing Flow

```text
User clicks a task
        ↓
<Link href={`/tasks/${task.id}`}>
        ↓
/tasks/<task-id>
        ↓
Next.js matches tasks/[id]/page.tsx
        ↓
params
        ↓
id = <task-id>
```

### Phase 10 Outcome

The Task Tracker now supports multiple pages, nested layouts, dynamic task-detail routes, and Next.js client-side navigation.

# Phase 11 — Reusable Components

## Objective

Learn how to create reusable, maintainable React components and make them flexible without creating components with a giant list of props.

---

## 1. Component Responsibilities

Instead of putting all UI logic into one large component, split the application into smaller components with clear responsibilities.

Example:

```text
TasksClient
    ↓
Manages task state and API/business logic

AddTaskForm
    ↓
Responsible for the add-task form

Button
    ↓
Reusable button UI

Panel
    ↓
Reusable container/layout




Reusable Components
        ↓
Clear component responsibilities
        ↓
Props for data and behaviour
        ↓
TypeScript for safe prop definitions
        ↓
children for flexible nested content
        ↓
React.ReactNode for renderable content
        ↓
Composition for flexible component design
        ↓
Avoid giant lists of configuration props
```

# Most important concepts to remember
	1. Props pass data and behaviour into components.
	2. children is a special prop containing nested content.
	3. React.ReactNode is a TypeScript type for content React can render.
	4. Composition makes components flexible without requiring many props.
	5. A reusable component should have a clear responsibility.
	6. Don't create a prop for every possible piece of content — consider composition.
Reusable components reduce duplication and make the application easier to maintain.