import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { createTaskSchema } from "@/src/validation/taskSchemas";
import { parseJsonBody } from "@/app/api/utils";
import { getCurrentUser } from "@/src/auth";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }

    const tasks = await db.orm.public.Task
     .where({ userId: user.id })
     .all();
     

    return NextResponse.json(tasks);
}





export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
    return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
    );
}

    const result = await parseJsonBody(
        request,
        createTaskSchema
    );

    if (!result.success) {
        return result.response;
    }


    const { title } = result.data;

    try {
        const task = await db.orm.public.Task.create({
            id: randomUUID(),
            title: title,
            userId: user.id
        });

        return Response.json(task, { status: 201 });

    } catch (error) {
        console.error("Failed to create task:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}

