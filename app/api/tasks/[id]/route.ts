import { NextResponse } from "next/server";
import { tasks } from "@/app/tasks/data";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;
    console.log("Deleting task:", id);

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return NextResponse.json(
            { error: "Task not found" },
            { status: 404 }
        );
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    return NextResponse.json(deletedTask);
}


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = await request.json();
    const completed = body.completed;
        if (typeof completed !== "boolean" ) {
        return NextResponse.json(
            { error: "completed is not a boolean." },
            { status: 400 }
        );
    }
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
        return NextResponse.json(
            { error: "Task not found" },
            { status: 404 }
        );
    }
    // mutation option
    //tasks[taskIndex].completed =   body.completed;

    // replacing the object with spread operator
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        completed: body.completed
    };
    return NextResponse.json(tasks[taskIndex]);

}