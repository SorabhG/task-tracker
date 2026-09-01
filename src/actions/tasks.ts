"use server";

import { randomUUID } from "crypto";
import { db } from "@/src/prisma/db";
import { createTaskSchema } from "@/src/validation/taskSchemas";
import {  requireCurrentUser } from "@/src/auth";

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