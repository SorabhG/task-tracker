import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { tasks } from "@/app/tasks/data";



export async function GET() {
  return NextResponse.json(tasks);
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

    const newTask = {
        id: randomUUID(),
        title: title.trim(),
        completed: false
    };

    tasks.push(newTask);

    return NextResponse.json(newTask, { status: 201 });
}

