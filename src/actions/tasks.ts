"use server";

import { randomUUID } from "crypto";
import { db } from "@/src/prisma/db";
import {
    createTaskSchema,
    type CreateTaskInput,
} from "@/src/validation/taskSchemas";
import { requireCurrentUser } from "@/src/auth";

export async function createTask(input: CreateTaskInput) {
    const user = await requireCurrentUser();

    const result = createTaskSchema.safeParse(input);
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
            dueDate: result.data.dueDate,
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