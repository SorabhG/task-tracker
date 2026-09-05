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

                    ┌───────────────────┐
                    │     Browser       │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Next.js App     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        Server Pages     Client Components   API Routes
              │               │                │
              │               │                │
              ▼               ▼                ▼
       Server Functions   Server Actions   Route Handlers
              │               │                │
              └───────────────┼────────────────┘
                              │
                              ▼
                    requireCurrentUser()
                              │
                              ▼
                       Authorization
                       / Ownership
                              │
                              ▼
                         Validation
                              │
                              ▼
                          PostgreSQL

You're right — you mean **one single consolidated README section**, not 29 separate blocks.

Here is **Phase 13 as one continuous copy-paste block**. You can select/copy the entire block in one attempt and paste it directly into `README.md`.

````md
# PHASE 13 — Advanced Next.js

## Objective

Understand the advanced Next.js concepts needed to turn the Task Tracker into a more realistic application:

- Server Components vs Client Components
- Server-side data fetching
- Route Handlers
- Authentication
- Authorization and task ownership
- `router.refresh()`
- React Server Components (RSC)
- `loading.tsx`
- `error.tsx`
- `async/await`
- Server Actions
- Server Action vs Route Handler
- Protected server-side functions
- Validation and error handling

---

## 1. Server Components vs Client Components

Next.js App Router uses Server Components by default.

### Server Component

Example:

```tsx
// app/tasks/page.tsx

export default async function TasksPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const tasks = await getTasksForUser(user.id);

    return (
        <Panel>
            <h2>My Tasks</h2>
            <TasksClient initialTasks={tasks} />
        </Panel>
    );
}
````

Server Components can:

* Access the database
* Read cookies
* Fetch server-side data
* Perform authentication checks
* Keep server-only code away from the browser

They cannot directly use browser-only React features such as:

```tsx
useState()
useEffect()
onClick
```

### Client Component

A Client Component starts with:

```tsx
"use client";
```

Example:

```tsx
"use client";

import { useState } from "react";
```

Client Components can:

* Use `useState`
* Use `useEffect`
* Handle clicks
* Handle forms
* Call APIs
* Call Server Actions
* Use browser functionality

---

## 2. Server → Client Data Flow

Our Task page follows this architecture:

```text
Browser
   ↓
/tasks
   ↓
app/tasks/page.tsx
(Server Component)
   ↓
getCurrentUser()
   ↓
getTasksForUser()
   ↓
Database
   ↓
tasks
   ↓
TasksClient
(Client Component)
   ↓
UI
```

Important principle:

```text
Server Component
      ↓
Database
```

is allowed.

But:

```text
Client Component
      ↓
Database
```

is not allowed directly.

---

## 3. Server-side Data Access

We created:

```text
src/tasks.ts
```

Example:

```ts
export async function getTasksForUser(userId: string) {
    return db.orm.public.Task
        .where({ userId })
        .orderBy(task => task.createdAt.desc())
        .all();
}
```

This is a normal server-side data-access function.

It is NOT a Server Action.

It does not need:

```ts
"use server";
```

when it is simply called from a Server Component.

Example:

```ts
const tasks = await getTasksForUser(user.id);
```

---

## 4. Route Handlers

Next.js Route Handlers provide HTTP endpoints.

We have:

```text
app/api/tasks/route.ts
```

for:

```text
GET
POST
```

and:

```text
app/api/tasks/[id]/route.ts
```

for:

```text
PATCH
DELETE
```

General flow:

```text
Browser / Postman
       ↓
HTTP request
       ↓
Route Handler
       ↓
Authentication
       ↓
Validation
       ↓
Authorization
       ↓
Database
       ↓
HTTP response
```

---

## 5. GET Tasks

Our GET endpoint is:

```text
GET /api/tasks
```

It uses:

```ts
const user = await requireCurrentUser();

const tasks = await getTasksForUser(user.id);

return NextResponse.json(tasks);
```

Important:

```ts
await getTasksForUser(...)
```

is required because `getTasksForUser()` is asynchronous and returns:

```ts
Promise<Task[]>
```

Without `await`, the variable represents a Promise rather than the resolved task array.

---

## 6. Authentication

Authentication answers:

```text
"Who are you?"
```

Our application uses a session cookie:

```text
sessionId
```

Login flow:

```text
Login
  ↓
Validate credentials
  ↓
Create session
  ↓
Set sessionId cookie
  ↓
Browser stores cookie
```

Later requests:

```text
Request
  ↓
Read sessionId cookie
  ↓
Find Session
  ↓
Check expiration
  ↓
Find User
  ↓
Authenticated user
```

---

## 7. getCurrentUser()

We created:

```text
src/auth.ts
```

with:

```ts
export async function getCurrentUser() {
    const cookieStore = await cookies();

    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
        return null;
    }

    const session = await db.orm.public.Session
        .where({ id: sessionId })
        .first();

    if (!session) {
        return null;
    }

    if (new Date(session.expiresAt) < new Date()) {
        return null;
    }

    const user = await db.orm.public.User
        .where({ id: session.userId })
        .first();

    if (!user) {
        return null;
    }

    return user;
}
```

The function returns:

```text
User
```

when the user is authenticated.

Otherwise:

```text
null
```

---

## 8. requireCurrentUser()

Instead of repeating:

```ts
const user = await getCurrentUser();

if (!user) {
    throw new Error("UNAUTHORIZED");
}
```

we created:

```ts
export async function requireCurrentUser() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    return user;
}
```

Protected server code can now simply use:

```ts
const user = await requireCurrentUser();
```

Flow:

```text
Authenticated
     ↓
Continue

Unauthenticated
     ↓
Throw UNAUTHORIZED
```

---

## 9. Authentication vs Authorization

These are different concepts.

### Authentication

```text
Who are you?
```

Example:

```text
Is the user logged in?
```

### Authorization

```text
What are you allowed to do?
```

Example:

```text
Can this user modify this particular task?
```

---

## 10. Task Ownership / Authorization

Initially, checking only:

```ts
where({ id })
```

was not enough.

A user could potentially access another user's task if only the task ID was checked.

We changed the database query to:

```ts
where({
    id,
    userId: user.id
})
```

This means:

```text
Task ID matches
AND
Task belongs to current user
```

This is an authorization / ownership check.

General flow:

```text
Request
   ↓
requireCurrentUser()
   ↓
Current user
   ↓
Query using id + userId
   ↓
Database
```

---

## 11. PATCH Authorization

Our PATCH endpoint uses:

```ts
const task = await db.orm.public.Task
    .where({
        id,
        userId: user.id
    })
    .update({
        completed
    });
```

Therefore:

```text
User A
  ↓
Can update
  ↓
User A's task

User A
  ↓
Cannot update
  ↓
User B's task
```

We tested this using Postman.

---

## 12. DELETE Authorization

DELETE uses the same ownership rule:

```ts
const task = await db.orm.public.Task
    .where({
        id,
        userId: user.id
    })
    .delete();
```

Therefore a user cannot delete another user's task.

---

## 13. router.refresh()

After a mutation we use:

```ts
router.refresh();
```

Example:

```ts
await createTask(title);

router.refresh();
```

`router.refresh()` is NOT a full browser reload.

It refreshes the current Server Component tree.

Flow:

```text
Client Component
      ↓
router.refresh()
      ↓
Server Component runs again
      ↓
getCurrentUser()
      ↓
getTasksForUser()
      ↓
Database
      ↓
Fresh server data
      ↓
Updated UI
```

---

## 14. React Server Components (RSC)

After:

```ts
router.refresh();
```

we may see requests such as:

```text
/tasks?_rsc=...
```

in DevTools.

`_rsc` is related to React Server Components communication.

Next.js uses this mechanism to request the updated Server Component payload.

It is normal and does not mean that the browser is doing a traditional full-page reload.

---

## 15. loading.tsx

Next.js supports:

```text
loading.tsx
```

for route-level loading UI.

Example:

```text
app/tasks/loading.tsx
```

Flow:

```text
/tasks
   ↓
loading.tsx
   ↓
Server Component finishes
   ↓
page.tsx
```

This allows the user to see loading feedback while server-side work is happening.

---

## 16. error.tsx

Next.js supports:

```text
error.tsx
```

for route-level UI error handling.

Example:

```text
app/tasks/error.tsx
```

Flow:

```text
Server Component
       ↓
Unexpected error
       ↓
error.tsx
       ↓
Error UI
```

`error.tsx` is primarily a UI-level error boundary.

It is NOT the same as Spring Boot's:

```text
@ControllerAdvice
```

because `error.tsx` does not act as a centralized API exception handler.

Expected API/action errors should normally be handled close to the operation.

---

## 17. async / await

Many Next.js server operations are asynchronous.

Example:

```ts
const user = await getCurrentUser();
```

An async function returns a Promise.

For example:

```ts
getTasksForUser(user.id)
```

returns:

```text
Promise<Task[]>
```

Using:

```ts
await getTasksForUser(user.id)
```

gives:

```text
Task[]
```

Simple mental model:

```text
async function
      ↓
returns Promise
      ↓
await
      ↓
resolved value
```

---

## 18. Server Actions

We created:

```text
src/actions/tasks.ts
```

with:

```ts
"use server";
```

Example:

```ts
"use server";

import { randomUUID } from "crypto";
import { db } from "@/src/prisma/db";
import { createTaskSchema } from "@/src/validation/taskSchemas";
import { requireCurrentUser } from "@/src/auth";

export async function createTask(title: string) {
    const user = await requireCurrentUser();

    const result = createTaskSchema.safeParse({ title });

    if (!result.success) {
        return {
            success: false,
            error: "Invalid task title",
        };
    }

    try {
        const task = await db.orm.public.Task.create({
            id: randomUUID(),
            title: result.data.title,
            userId: user.id,
        });

        return {
            success: true,
            task,
        };
    } catch (error) {
        console.error("Failed to create task:", error);

        return {
            success: false,
            error: "Something went wrong.",
        };
    }
}
```

---

## 19. Server Action Flow

The Client Component can call:

```ts
const result = await createTask(title);
```

Flow:

```text
Client Component
      ↓
Server Action
      ↓
requireCurrentUser()
      ↓
Validation
      ↓
Database
      ↓
Result
      ↓
Client Component
```

The database code remains on the server.

---

## 20. Server Action vs Normal Server Function

This distinction is important.

### Normal server/data-access function

Example:

```ts
getTasksForUser()
```

Location:

```text
src/tasks.ts
```

Flow:

```text
Server Component
      ↓
getTasksForUser()
      ↓
Database
```

It does NOT need:

```ts
"use server";
```

### Server Action

Example:

```ts
createTask()
```

Location:

```text
src/actions/tasks.ts
```

Marked with:

```ts
"use server";
```

It can be invoked from the Next.js application as a server-side action.

Therefore:

```text
src/tasks.ts
        ↓
Normal server/data-access functions

src/actions/tasks.ts
        ↓
Server Actions
```

---

## 21. Server Action vs Route Handler

Both can perform mutations, but they use different mechanisms.

### Route Handler

Example:

```text
POST /api/tasks
```

Flow:

```text
Client
   ↓
HTTP POST
   ↓
Route Handler
   ↓
Database
   ↓
HTTP Response
```

Useful for:

* APIs
* Postman
* External clients
* HTTP integrations

### Server Action

Example:

```ts
createTask(title)
```

Flow:

```text
Client Component
   ↓
Server Action
   ↓
Database
   ↓
Result
```

Useful for:

* Mutations from the Next.js application
* Form submissions
* Create/update/delete operations

---

## 22. Server Actions Are Not Limited to POST

Server Actions are not technically limited to creating records.

They can be used for mutations such as:

```text
Create
Update
Delete
```

For our learning project, we deliberately kept a mixture:

```text
CREATE
   ↓
Server Action

UPDATE
   ↓
PATCH Route Handler

DELETE
   ↓
DELETE Route Handler
```

This lets us understand both approaches.

---

## 23. Validation

We use Zod for validation.

Example:

```ts
export const createTaskSchema = z.object({
    title: z.string().min(1),
});
```

API requests are validated before database operations.

Example:

```ts
const result = await parseJsonBody(
    request,
    createTaskSchema
);
```

Server Actions also validate:

```ts
const result = createTaskSchema.safeParse({ title });
```

Important principle:

```text
Client validation
       +
Server validation
```

Client validation improves user experience.

Server validation protects the application.

---

## 24. Error Handling

For expected mutation failures, we handle errors close to the operation.

Server Action example:

```ts
try {
    // database operation
} catch (error) {
    console.error(error);

    return {
        success: false,
        error: "Something went wrong.",
    };
}
```

API routes return appropriate HTTP status codes.

Examples:

```text
400 → Bad Request
404 → Not Found
500 → Server Error
```

Example:

```ts
return NextResponse.json(
    { error: "Task not found" },
    { status: 404 }
);
```

---

## 25. Current Task Architecture

Our application now follows this general architecture:

```text
                         Browser
                            │
              ┌─────────────┴─────────────┐
              │                           │
           /tasks                    /api/tasks
              │                           │
       Server Component              Route Handler
              │                           │
       getCurrentUser()             requireCurrentUser()
              │                           │
       getTasksForUser()              Validation
              │                           │
              └─────────────┬─────────────┘
                            │
                         Database
```

Mutation architecture:

### Create

```text
Browser
  ↓
TasksClient
  ↓
Server Action
  ↓
requireCurrentUser()
  ↓
Validation
  ↓
Database
  ↓
router.refresh()
  ↓
Server Component
  ↓
Fresh tasks
```

### Update

```text
Browser
  ↓
TasksClient
  ↓
PATCH /api/tasks/[id]
  ↓
requireCurrentUser()
  ↓
Ownership check
  ↓
Database
  ↓
router.refresh()
```

### Delete

```text
Browser
  ↓
TasksClient
  ↓
DELETE /api/tasks/[id]
  ↓
requireCurrentUser()
  ↓
Ownership check
  ↓
Database
  ↓
router.refresh()
```

---

## 26. Optimistic UI — Parked

We experimented with:

```ts
useOptimistic()
```

but intentionally parked advanced optimistic UI.

We encountered:

```text
An optimistic state update occurred outside a transition or action.
```

We also discussed:

```ts
startTransition()
```

but decided not to spend more time on this topic during Phase 13.

For now our approach is:

```text
Mutation
   ↓
Server
   ↓
router.refresh()
   ↓
Server truth
```

This is simpler and reliable.

Advanced optimistic UI can be revisited later.

---

## 27. Task Sorting

Tasks are currently sorted on the server using:

```ts
.orderBy(task => task.createdAt.desc())
```

Therefore `router.refresh()` fetches tasks according to the database sorting rule.

Important:

```text
completed
```

does not automatically change the task's position.

The current sorting is based on:

```text
createdAt DESC
```

---

## 28. Key Lessons From Phase 13

### Server Components

Can access:

```text
Database
Cookies
Server-side functions
```

### Client Components

Can use:

```text
useState
useEffect
Browser events
Forms
APIs
Server Actions
```

### Authentication

Answers:

```text
Who are you?
```

### Authorization

Answers:

```text
Are you allowed to perform this operation?
```

### Task Ownership

Always include the authenticated user's ID when querying protected user-owned data:

```ts
where({
    id,
    userId: user.id
})
```

### router.refresh()

Refreshes the Server Component tree and retrieves fresh server data.

It is not a full browser reload.

### Server Actions

Allow application mutations to execute on the server.

### Route Handlers

Provide HTTP endpoints and are useful for APIs and external clients.

### Normal Server Functions

Can directly access the database when called from server-side code.

They are not automatically Server Actions.

### loading.tsx

Provides route-level loading UI.

### error.tsx

Provides route-level UI error handling.

### async/await

Used to work with asynchronous server operations and Promises.

---

## 29. Topics Intentionally Parked

These advanced topics were deliberately postponed:

* Middleware
* Advanced `useOptimistic`
* Advanced `startTransition`
* Advanced Server Action pending integration
* Advanced caching
* Advanced revalidation strategies

They can be revisited later if needed.

---

# PHASE 13 — COMPLETE

We now have a much more realistic Next.js application with:

* Server Components
* Client Components
* Server-side database access
* Route Handlers
* Authentication
* Authorization
* Task ownership
* Zod validation
* Server Actions
* Error handling
* Loading UI
* Server Component refresh
* Protected server functions

Current architecture:

```text
                    ┌───────────────────┐
                    │      Browser      │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │    Next.js App     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
       Server Pages     Client Components   API Routes
              │               │                │
              ▼               ▼                ▼
      Server Functions   Server Actions   Route Handlers
              │               │                │
              └───────────────┼────────────────┘
                              │
                              ▼
                    requireCurrentUser()
                              │
                              ▼
                       Authorization
                       / Ownership
                              │
                              ▼
                         Validation
                              │
                              ▼
                         PostgreSQL

```

---

# NEXT — PHASE 14

## PHASE 14 — Production Readiness

We will prepare the Task Tracker to run like a real production application.

Topics:

1. Environment variables
2. Production configuration
3. Production database configuration
4. Database migrations
5. Security review
6. Production error handling
7. `npm run build`
8. Dockerize the application
9. AWS deployment preparation

Then:

# PHASE 15 — AWS Deployment

Planned topics:

* AWS infrastructure
* Deploy Next.js application
* Production PostgreSQL
* Secrets
* HTTPS
* Domain
* Logs and monitoring
* Final production testing

```

This is now **one single README block** — copy everything inside it in one go.
```
                          
                         AWS
 ┌─────────────────────────────────────────────┐
 │                                             │
 │  Internet                                   │
 │     │                                       │
 │     ▼                                       │
 │  ┌──────────────────────┐                   │
 │  │ ECS Fargate          │                   │
 │  │ Next.js container    │                   │
 │  └──────────┬───────────┘                   │
 │             │                               │
 │             │ Private VPC                   │
 │             ▼                               │
 │  ┌──────────────────────┐                   │
 │  │ RDS PostgreSQL        │                   │
 │  │ db.t4g.micro         │                   │
 │  └──────────────────────┘                   │
 │                                             │
 └─────────────────────────────────────────────┘


 deployment pipeline
 Your laptop
     │
     ▼
Git repository
     │
     ▼
Docker image
     │
     ▼
Amazon ECR
     │
     ▼
ECS Fargate
     │
     ▼
RDS PostgreSQL


Next.js build
      ↓
Docker image
      ↓
Docker container
      ↓
ECR
      ↓
ECS
      ↓
RDS




Absolutely. Below is **one single consolidated copy-paste block** for your `README.md`, covering **Phase 14 + Phase 15**, including what we actually did, the AWS architecture, important commands, environment-variable confusion, IAM roles, RDS, ECR, ECS, deployment/update flow, and cost cleanup.

````markdown
# Phase 14 & Phase 15 — Production Readiness + AWS Deployment 🚀

## Overview

Phase 14 prepared the Task Tracker application for production.

Phase 15 deployed the application to AWS using Docker, Amazon ECR, Amazon ECS/Fargate, Amazon RDS PostgreSQL and AWS Secrets Manager.

The overall production architecture became:

```text
                    Internet
                       │
                       ▼
                AWS ECS / Fargate
                task-tracker app
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
      Secrets Manager        RDS PostgreSQL
      task-tracker/rds       task-tracker-db
             │
             └──── DATABASE_URL
````

Local development remained:

```text
Developer machine
       │
       ▼
Next.js application
       │
       ▼
Docker
       │
       ▼
PostgreSQL Docker container
       │
       ▼
task_tracker database
```

Production became:

```text
Developer machine
       │
       │ docker build
       ▼
Docker image
       │
       │ docker push
       ▼
Amazon ECR
       │
       │ ECS pulls image
       ▼
Amazon ECS / Fargate
       │
       │ DATABASE_URL from Secrets Manager
       ▼
Amazon RDS PostgreSQL
```

---

# PHASE 14 — PRODUCTION READINESS

## 14.1 Environment Variables

We separated configuration from application code.

The application uses:

```text
DATABASE_URL
```

instead of hard-coding database connection information.

### Local

Local `.env` contains a local PostgreSQL connection:

```env
DATABASE_URL=postgresql://taskuser:taskpassword@localhost:5432/task_tracker
```

This works when the application runs directly on the developer machine because PostgreSQL is also running locally.

### Production

The ECS container cannot use:

```text
localhost
```

for the database.

Inside ECS, `localhost` means:

```text
the ECS application container itself
```

not the RDS database.

Therefore production uses the RDS hostname:

```text
postgresql://taskuser:password@task-tracker-db.xxxxx.ap-south-1.rds.amazonaws.com:5432/postgres
```

The production DATABASE_URL was stored in:

```text
AWS Secrets Manager
```

rather than committing the password into Git or the Docker image.

---

# 14.2 Important Environment Variable Concept

Environment variables belong to the environment where the application is running.

For example:

```text
LOCAL
DATABASE_URL
    ↓
localhost:5432/task_tracker
```

while:

```text
AWS
DATABASE_URL
    ↓
task-tracker-db.xxxxx.rds.amazonaws.com:5432/postgres
```

The application code does not need to change.

It simply reads:

```text
process.env.DATABASE_URL
```

The environment provides the appropriate value.

Therefore:

```text
Same application code
        │
        ├── Local → local PostgreSQL
        │
        └── AWS   → RDS PostgreSQL
```

This is one of the most important production configuration concepts learned in this phase.

---

# 14.3 Production Error Handling and Security

We reviewed the application for production readiness, including:

* Environment variables
* Authentication
* Password hashing
* Session handling
* API validation
* Error handling
* Database access
* Production configuration
* Docker build verification

Sensitive credentials were not intended to be stored in source code.

---

# 14.4 Database Migration / Production DB

We learned that creating a PostgreSQL database server does NOT automatically create our application tables.

The RDS instance initially provides PostgreSQL and a database such as:

```text
postgres
```

Our application schema/tables need to be created using the application's database migration process.

Conceptually:

```text
RDS PostgreSQL
      │
      ▼
Run Prisma migration
      │
      ▼
Create application tables
      │
      ▼
User
Session
Task
...
```

Local and production databases are separate databases.

Local:

```text
task_tracker
```

AWS:

```text
postgres
```

The database name does not have to be identical.

What matters is that:

```text
DATABASE_URL
```

points to the correct production database.

---

# 14.5 Production Build Verification

We verified that the application could be built successfully using:

```powershell
npm run build
```

We then built the production Docker image.

The Docker build completed successfully:

```powershell
docker build -t task-tracker:local .
```

The image was confirmed as:

```text
linux/amd64
```

using:

```powershell
docker image inspect task-tracker:local --format "{{.Os}}/{{.Architecture}}"
```

Result:

```text
linux/amd64
```

We initially considered ARM64 because Fargate ARM can be cheaper, but building the ARM64 image locally resulted in:

```text
exec format error
```

Therefore, for this POC we continued with:

```text
Linux / AMD64
```

because the cost difference was small and the goal was to finish the learning exercise efficiently.

---

# PHASE 15 — AWS DEPLOYMENT 🚀

# 15.1 AWS Account / IAM User

We used a personal AWS account rather than an organisation/office AWS account.

An IAM user named:

```text
developer
```

was used for AWS CLI operations.

The AWS CLI was configured with an access key created for this IAM user.

We verified the currently authenticated AWS identity with:

```powershell
aws sts get-caller-identity
```

This is useful whenever there is confusion about:

```text
Which AWS account?
Which IAM user?
Which credentials?
```

---

# 15.2 IAM Permissions

The IAM user had permissions through the existing `dev` group, including AWS managed policies such as:

```text
AmazonAPIGatewayAdministrator
AmazonDynamoDBFullAccess
AWSLambda_FullAccess
CloudWatchLogsFullAccess
```

There was also:

```text
DeveloperSelfManageIAM
```

and:

```text
IAMUserChangePassword
```

For ECS, an important distinction was learned:

## IAM User vs IAM Role

The IAM user:

```text
developer
```

is the identity used by us to operate AWS.

The ECS task does NOT run using the developer user's credentials.

Instead, ECS uses an IAM role.

For example:

```text
developer IAM user
       │
       │ creates/configures
       ▼
ECS resources
       │
       ▼
ecsTaskExecutionRole
       │
       │ used by ECS task
       ▼
ECR / Secrets Manager / CloudWatch logging
```

This is an important AWS security concept.

---

# 15.3 ecsTaskExecutionRole

We used:

```text
ecsTaskExecutionRole
```

as the ECS task execution role.

Its purpose is to give ECS permission to perform actions required to start/run the container, such as:

* Pull the Docker image from ECR
* Read required AWS secrets
* Perform required ECS execution operations
* Send container logs when configured

The developer user creates/configures the ECS resources.

The ECS task then assumes/uses the execution role.

Therefore:

```text
developer
    ↓
creates ECS task definition

ecsTaskExecutionRole
    ↓
used by running ECS task
```

They are two different identities.

---

# 15.4 ECS Service-Linked Role

During ECS cluster creation we initially received:

```text
Unable to assume the service linked role.
Please verify that the ECS service linked role exists.
```

We checked:

```powershell
aws iam get-role --role-name AWSServiceRoleForECS
```

This confirmed that:

```text
AWSServiceRoleForECS
```

existed.

After logging out and back into AWS, the ECS cluster creation succeeded.

This was a useful lesson:

```text
AWS services may require service-linked IAM roles
```

These are different from the ECS task execution role.

---

# 15.5 Amazon RDS PostgreSQL

We created an Amazon RDS PostgreSQL instance:

```text
DB identifier:
task-tracker-db
```

Region:

```text
ap-south-1
```

Mumbai.

Instance class used:

```text
db.t4g.micro
```

The RDS endpoint looked similar to:

```text
task-tracker-db.xxxxx.ap-south-1.rds.amazonaws.com
```

RDS provides managed PostgreSQL so that we do not have to run PostgreSQL ourselves on an EC2 server.

---

# 15.6 RDS Credentials

The RDS username was:

```text
taskuser
```

The password was configured when the database was created.

The credentials were not supposed to be placed directly into source code.

We used AWS Secrets Manager for the production database connection information.

---

# 15.7 Local PostgreSQL vs RDS PostgreSQL

Our Docker Compose setup was:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: task-tracker-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: taskuser
      POSTGRES_PASSWORD: taskpassword
      POSTGRES_DB: task_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

This creates:

```text
PostgreSQL Docker container
        │
        └── task_tracker database
```

AWS RDS is completely separate:

```text
AWS RDS PostgreSQL
        │
        └── postgres database
```

Therefore:

```text
LOCAL DATABASE ≠ PRODUCTION DATABASE
```

The same application code can work with both because the database location is supplied through:

```text
DATABASE_URL
```

---

# 15.8 Amazon ECR

We created an Amazon Elastic Container Registry repository:

```text
task-tracker
```

ECR is essentially our AWS Docker image registry.

The flow is:

```text
Local Docker image
       │
       ▼
ECR
       │
       ▼
ECS/Fargate
```

We authenticated Docker to ECR using:

```powershell
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 361432258735.dkr.ecr.ap-south-1.amazonaws.com
```

Result:

```text
Login Succeeded
```

---

# 15.9 Docker Image Tagging

Our local image was:

```text
task-tracker:local
```

We tagged it with the ECR repository:

```powershell
docker tag task-tracker:local 361432258735.dkr.ecr.ap-south-1.amazonaws.com/task-tracker:latest
```

This does NOT rebuild the image.

It gives the existing Docker image another name/tag so Docker knows where it should be pushed.

---

# 15.10 Push Image to ECR

We pushed the image:

```powershell
docker push 361432258735.dkr.ecr.ap-south-1.amazonaws.com/task-tracker:latest
```

The image was successfully uploaded to ECR.

The important flow is:

```text
docker build
      ↓
task-tracker:local
      ↓
docker tag
      ↓
ECR image name
      ↓
docker push
      ↓
Amazon ECR
```

---

# 15.11 ECS Cluster

We created:

```text
task-tracker-cluster
```

The ECS cluster is the logical environment that holds our ECS tasks/services.

We selected:

```text
Fargate
```

because it is serverless container infrastructure.

We do not manage EC2 servers.

Architecture:

```text
ECS Cluster
     │
     └── Fargate
           │
           └── Task / Service
                 │
                 └── Docker container
```

---

# 15.12 ECS Task Definition

We created the task definition family:

```text
task-tracker
```

Revision:

```text
task-tracker:1
```

Configuration:

```text
Launch type: Fargate
OS: Linux
Architecture: X86_64
CPU: 0.25 vCPU
Memory: 0.5 GB
```

Container:

```text
Name: task-tracker
Port: 3000 TCP
Essential: Yes
```

The task definition is essentially the deployment blueprint for our container.

It tells ECS:

```text
Which Docker image?
How much CPU?
How much memory?
Which port?
Which IAM execution role?
Which environment/secrets?
```

---

# 15.13 CPU Configuration

Initially we encountered:

```text
The sum of the container CPU must not exceed the task CPU.
```

The reason was that the container CPU allocation was greater than the task CPU allocation.

We corrected it so that:

```text
Task CPU = 0.25 vCPU
Container CPU = 0.25 vCPU
```

The task definition was then successfully created.

---

# 15.14 Secrets Manager

We created a secret:

```text
task-tracker/rds
```

The secret contains the production database connection information.

Conceptually:

```text
Secrets Manager
      │
      ▼
task-tracker/rds
      │
      ▼
DATABASE_URL
      │
      ▼
ECS container
```

The purpose is to avoid putting the production database password directly into:

```text
Git
Dockerfile
source code
```

---

# 15.15 ECS Permission to Read the Secret

The ECS task execution role needs permission to retrieve the secret.

The role used was:

```text
ecsTaskExecutionRole
```

The permission is associated with the role, not directly with the developer user.

Conceptually:

```text
developer
   │
   │ creates/configures
   ▼
ecsTaskExecutionRole
   │
   │ allowed to read
   ▼
Secrets Manager
   │
   ▼
task-tracker/rds
```

---

# 15.16 Environment Variable vs Secret

This was one of the confusing parts initially.

An ECS task can receive configuration through environment variables.

For example:

```text
DATABASE_URL
```

But there is an important distinction.

### Normal environment variable

```text
DATABASE_URL = some-value
```

The value is directly specified.

### Secret-backed environment variable

```text
DATABASE_URL
      ↓
Secrets Manager
      ↓
task-tracker/rds
```

The ECS task retrieves the secret value at runtime.

Therefore our application still simply sees:

```text
process.env.DATABASE_URL
```

The application does not need to know whether the value came from:

```text
.env
```

or:

```text
AWS Secrets Manager
```

---

# 15.17 ECS Service

An ECS Service keeps the desired number of tasks running.

Conceptually:

```text
ECS Cluster
     │
     ▼
ECS Service
     │
     ▼
Fargate Task
     │
     ▼
task-tracker container
```

If the task stops unexpectedly, the service can replace it according to the desired-count configuration.

---

# 15.18 CloudWatch

We did not explicitly configure a complicated CloudWatch monitoring setup for this POC.

Some ECS/related logging functionality can appear automatically as part of the AWS deployment configuration.

For this learning project, we kept monitoring simple rather than adding unnecessary observability components and cost.

---

# 15.19 Final AWS Architecture

Our completed POC architecture is:

```text
                    ┌─────────────────────┐
                    │      Internet       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   ECS Fargate       │
                    │                     │
                    │ task-tracker        │
                    │ Docker container     │
                    │ Port 3000            │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌───────────────────┐       ┌──────────────────┐
       │ Secrets Manager   │       │ Amazon RDS        │
       │                   │       │ PostgreSQL        │
       │ task-tracker/rds  │       │ task-tracker-db   │
       └─────────┬─────────┘       └──────────────────┘
                 │
                 │ DATABASE_URL
                 └──────────────────────►
```

Docker image flow:

```text
Developer PC
     │
     │ docker build
     ▼
Docker image
     │
     │ docker tag
     │ docker push
     ▼
Amazon ECR
     │
     │ ECS pulls image
     ▼
Fargate
```

---

# 15.20 Useful AWS CLI Commands

### Check which AWS identity is active

```powershell
aws sts get-caller-identity
```

Useful for confirming:

```text
AWS account
IAM user
current credentials
```

---

### Check ECS service-linked role

```powershell
aws iam get-role --role-name AWSServiceRoleForECS
```

---

### Check RDS master username

We attempted:

```powershell
aws rds describe-db-instances --db-instance-identifier task-tracker-db --query "DBInstances[0].MasterUsername" --output text
```

The command returned:

```text
AccessDenied
```

because the `developer` IAM user did not have:

```text
rds:DescribeDBInstances
```

permission.

This was another useful IAM lesson:

```text
Being able to see/manage something in the AWS Console as Root
does not automatically mean an IAM user has the same permission.
```

---

# 15.21 Updating the Application After Code Changes

Once the AWS deployment is working, the normal update process is:

```text
1. Change code
       ↓
2. Test locally
       ↓
3. npm run build
       ↓
4. docker build
       ↓
5. docker tag
       ↓
6. docker push to ECR
       ↓
7. Create/update ECS task definition revision
       ↓
8. Deploy/update ECS service
       ↓
9. ECS starts new task
       ↓
10. ECS pulls new image
       ↓
11. Test production application
```

Example:

```powershell
docker build -t task-tracker:local .
```

Then:

```powershell
docker tag task-tracker:local 361432258735.dkr.ecr.ap-south-1.amazonaws.com/task-tracker:latest
```

Then:

```powershell
docker push 361432258735.dkr.ecr.ap-south-1.amazonaws.com/task-tracker:latest
```

Then update/deploy the ECS service.

---

# 15.22 If We Create Another Project

Suppose we create:

```text
advanced-task-tracker-project2
```

We should generally give it its own AWS resources.

For example:

```text
ECR
advanced-task-tracker-project2

ECS
advanced-task-tracker-project2 cluster/service

Secrets Manager
advanced-task-tracker-project2/rds

RDS
separate DB/database/schema as required
```

Conceptually:

```text
Project 1                         Project 2

Task Tracker                      Advanced Task Tracker
     │                                  │
     ▼                                  ▼
ECR repository                      ECR repository
     │                                  │
     ▼                                  ▼
ECS service                         ECS service
     │                                  │
     ▼                                  ▼
RDS / Secrets                       RDS / Secrets
```

AWS accounts can contain many projects.

The important thing is to keep resources clearly named and separated.

---

# 15.23 Cost Awareness

For this POC, the goal was:

```text
Build → Deploy → Test → Learn → Delete/stop
```

rather than keeping the infrastructure running permanently.

Important cost-generating resources can include:

```text
RDS
Fargate tasks
Load balancers
NAT Gateway
CloudWatch/log storage
ECR storage
```

For a short-lived learning POC, we should avoid leaving unnecessary resources running.

---

# 15.24 What To Do When The POC Is Finished

Before finishing the AWS experiment, review the resources.

### ECS

Stop/delete the running ECS service/tasks.

If the cluster is no longer needed:

```text
Delete ECS service
Delete ECS cluster
```

### RDS

RDS is particularly important because an active database instance continues to incur charges.

For a temporary POC:

```text
Stop RDS
```

or, if the database will never be needed again:

```text
Delete RDS
```

If deleting, take a final snapshot only if the data is worth keeping.

### ECR

ECR storage is relatively small for a single POC image, but unused images can be deleted.

### Secrets Manager

Delete the secret if it is no longer needed.

### CloudWatch

Review any log groups created for the application and remove unnecessary resources/log retention if appropriate.

### Other AWS Resources

Always check for:

```text
EC2 instances
Elastic IPs
Load Balancers
NAT Gateways
VPC resources
ECS tasks
RDS instances
CloudWatch logs
```

The most important rule is:

```text
Do not assume that deleting the ECS cluster deletes every AWS resource
created during the project.
```

Each service/resource should be reviewed.

---

# 15.25 Final Learning Summary

The biggest AWS concepts learned in Phase 15 were:

```text
IAM
 ↓
Who is allowed to do what?

ECR
 ↓
Where is my Docker image stored?

ECS
 ↓
Where do I run my container?

Fargate
 ↓
How do I run containers without managing servers?

Task Definition
 ↓
How should ECS run my container?

ECS Service
 ↓
How do I keep my application task running?

RDS
 ↓
Where does my production PostgreSQL database live?

Secrets Manager
 ↓
Where do I safely store production credentials?

Environment Variables
 ↓
How does the same application use different configuration
in local and production environments?

Docker
 ↓
How do I package the application consistently?

AWS CLI
 ↓
How do I interact with AWS from the command line?
```

---

# Phase 14 + 15 — Final End-to-End Picture

```text
                         DEVELOPMENT

Developer
   │
   ▼
Next.js + TypeScript
   │
   ▼
Docker
   │
   ├──────────────► Local PostgreSQL
   │                    │
   │                    └── task_tracker
   │
   ▼
Production Docker Image
   │
   │ docker push
   ▼
                         AWS

                     Amazon ECR
                         │
                         │ image
                         ▼
                 ECS / Fargate
                         │
                         │ runs
                         ▼
                  Task Tracker
                    container
                         │
                         │ DATABASE_URL
                         ▼
                Secrets Manager
                task-tracker/rds
                         │
                         ▼
                  Amazon RDS
                  PostgreSQL
                         │
                         ▼
                  Production DB
```

## Phase 14

```text
Production readiness
       │
       ├── Environment variables
       ├── Error handling
       ├── Security review
       ├── Database migrations
       ├── Production configuration
       └── Build verification
```

## Phase 15

```text
AWS Deployment
       │
       ├── Docker/container strategy
       ├── AWS CLI + IAM
       ├── Amazon ECR
       ├── Amazon RDS PostgreSQL
       ├── AWS Secrets Manager
       ├── ECS Cluster
       ├── ECS Task Definition
       ├── ECS Service
       ├── AWS Fargate
       ├── Environment/secrets
       ├── Production configuration
       ├── Deployment/testing
       └── Cost awareness + cleanup
```

## Key takeaway

The application itself did not fundamentally change between local and AWS.

What changed was the infrastructure around it:

```text
LOCAL

Next.js
  +
Docker
  +
PostgreSQL Docker container


PRODUCTION

Next.js
  +
Docker
  +
ECR
  +
ECS/Fargate
  +
Secrets Manager
  +
RDS PostgreSQL
```

The same application code can therefore move from:

```text
localhost
```

to:

```text
AWS
```

by changing the environment and infrastructure configuration rather than rewriting the application.

```
```
