import { z } from "zod";

export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(100, "Title must be 100 characters or less"),

    dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date")
        .nullable()
});

export const updateTaskSchema = z.object({
    completed: z.boolean()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;