import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const task = await db.orm.public.Task
        .where({ id })
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
}


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = await request.json();
    const completed = body.completed;

    if (typeof completed !== "boolean") {
        return NextResponse.json(
            { error: "completed is not a boolean." },
            { status: 400 }
        );
    }

    const task = await db.orm.public.Task
        .where({ id })
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
}