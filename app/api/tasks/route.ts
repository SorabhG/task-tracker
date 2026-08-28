import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";


export async function GET() {
    const tasks = await db.orm.public.Task.all();

    return Response.json(tasks);
}


export async function POST(request: Request) {

    const body = await request.json();

    const title = body.title;

    if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
            { error: "Title is required" },
            { status: 400 }
        );
    }



    const task = await db.orm.public.Task.create({

        id: randomUUID(),
        title

    });

    return Response.json(task, { status: 201 });
}

