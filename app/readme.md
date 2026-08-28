
````md
# Task Tracker

A learning project built with **Next.js, React, TypeScript** and a simple in-memory API.

## Task Model

```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
};
````

## Current Architecture

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
                 ┌─────┴─────┐
                 │           │
                 ▼           ▼
           AddTaskForm    Task List
             Client        Client
```

## API Contract

### GET /api/tasks

Returns all tasks.

```text
GET /api/tasks
       │
       ▼
    Task[]
```

### POST /api/tasks

Creates one task.

Request:

```json
{
  "title": "Learn React"
}
```

Response: `201 Created`

```json
{
  "id": "generated-uuid",
  "title": "Learn React",
  "completed": false
}
```

Invalid title returns `400 Bad Request`:

```json
{
  "error": "Title is required"
}
```

## Add Task Flow

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
addTask()
 │
 ▼
POST /api/tasks
 │
 ▼
Server creates task
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

## Current Status

Completed:

* React components and props
* Functions as props
* React state with `useState`
* `map`, `filter` and spread operator
* GET `/api/tasks`
* POST `/api/tasks`
* Request/response JSON
* Server-side validation
* HTTP status codes
* Client-side API error handling
* UUID task IDs

Next:

* DELETE `/api/tasks/[id]`
* Complete/Update task API
* Fetch tasks from client
* Loading and error states
* Database persistence

````

### One small Git step

Since you already pushed the previous README, after replacing it:

```powershell
git add README.md
git commit -m "Update project documentation"
git push
````

PATCH /api/tasks/:id

Request:
{
  "completed": true
}

Success:
200 OK

Response:
{
  "id": "123",
  "title": "Learn React",
  "completed": true
}

PATCH /api/tasks/123
          │
          ▼
      params.id
          │
          ▼
    find task by ID
          │
       ┌──┴──┐
       │     │
      -1    found
       │     │
       ▼     ▼
     404   read body
             │
             ▼
       completed value
             │
             ▼
       update task
             │
             ▼
        return task



                 React UI
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
         GET       POST     PATCH/DELETE
          │         │         │
          └─────────┼─────────┘
                    ↓
                Next.js API
                    │
                    ↓
              In-memory data        


============================
db
src/prisma/contract.prisma
src/prisma/db.ts
prisma.config.ts
.env.example


Next.js
    │
    │
    ▼
Prisma 8
    │
    │
    ▼
Docker PostgreSQL
    │
    ▼
task_tracker


┌─────────────────────────────┐
│           task              │
├───────────┬─────────────────┤
│ id        │ TEXT            │ PK
│ title     │ TEXT            │
│ completed │ BOOLEAN         │ DEFAULT false
│ createdAt │ TIMESTAMPTZ     │ DEFAULT now()
└───────────┴─────────────────┘