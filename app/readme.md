# Task Tracker

A learning project built with Next.js, React, TypeScript and a simple in-memory API.

## Current Architecture

The application has two main parts:

- React client UI
- Next.js API routes

The server currently stores tasks in memory.

## Task Model

A task has the following structure:

```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
};

```


