"use client";

import Link from "next/link";
import { Task } from "@/app/tasks/types";
import Button from "./Button";

type Props = {
    task: Task;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    isUpdating: boolean;
    isDeleting: boolean;
};

export default function TaskItem({
    task,
    onComplete,
    onDelete,
    isUpdating,
    isDeleting
}: Props) {
    return (
        <li>
            <span>
                <Link href={`/tasks/${task.id}`}>
                    {task.title}
                </Link>
            </span>

            <span style={{ marginLeft: "30px" }}>
                {task.completed ? "Completed" : "Pending"}
            </span>

            <Button
                onClick={() => onComplete(task.id)}
                disabled={isUpdating}
            >
                {isUpdating
                    ? "Updating..."
                    : task.completed
                        ? "Undo"
                        : "Complete"}
            </Button>

            <Button
   
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </Button>
        </li>
    );
}