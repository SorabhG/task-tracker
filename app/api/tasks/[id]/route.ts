import { NextResponse } from "next/server";
import { updateTaskSchema } from "@/src/validation/taskSchemas";
import { db } from "@/src/prisma/db";
import { parseJsonBody } from "@/app/api/utils";
import { getCurrentUser, requireCurrentUser } from "@/src/auth";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireCurrentUser();
    const { id } = await params;
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        const task = await db.orm.public.Task
            .where({
                id,
                userId: user.id
            })
            .delete();

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete task:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireCurrentUser();

    const { id } = await params;

    const result = await parseJsonBody(
        request,
        updateTaskSchema
    );

    if (!result.success) {
        return result.response;
    }

    const { completed } = result.data;
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const task = await db.orm.public.Task
            .where({
                id,
                userId: user.id
            })
            .update({
                completed
            });

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        return Response.json(task);

    } catch (error) {
        console.error("Failed to update task:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}