"use client";

import Link from "next/link";
import { Task } from "@/app/tasks/types";
import Button from "./Button";
import { useState } from "react";

type Props = {
    task: Task;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onDueDateChange: (id: string, dueDate: string | null) => Promise<boolean>;
    isUpdating: boolean;
    isDeleting: boolean;
};


function getDueDateLabel(dueDate: Date | string | null) {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const today = new Date();

    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const differenceInDays =
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (differenceInDays < 0) {
        return "Overdue";
    }

    if (differenceInDays === 0) {
        return "Due today";
    }

    if (differenceInDays === 1) {
        return "Due tomorrow";
    }

    return `Due ${due.toLocaleDateString()}`;
}




export default function TaskItem({
    task,
    onComplete,
    onDelete,
    onDueDateChange,
    isUpdating,
    isDeleting
}: Props) {
    const dueDateLabel = getDueDateLabel(task.dueDate);
    const [isEditing, setIsEditing] = useState(false);
    const [editDueDate, setEditDueDate] = useState(
        task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : ""
    );

async function handleSaveDueDate() {
    const success = await onDueDateChange(
        task.id,
        editDueDate || null
    );

    if (success) {
        setIsEditing(false);
    }
}


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

            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="border rounded px-2 py-1"
                    />

                    <button
                        type="button"
                        onClick={handleSaveDueDate}
                        className="text-green-600 hover:underline"
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-gray-600 hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                dueDateLabel && (
                    <span
                        className={
                            task.completed
                                ? "text-gray-400"
                                : dueDateLabel === "Overdue"
                                    ? "text-red-600 font-semibold"
                                    : dueDateLabel === "Due today"
                                        ? "text-orange-600 font-semibold"
                                        : dueDateLabel === "Due tomorrow"
                                            ? "text-yellow-600 font-semibold"
                                            : "text-gray-600"
                        }
                    >
                        {dueDateLabel}
                    </span>
                )
            )}

            {!isEditing && (
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:underline"
                >
                    Edit
                </button>
            )}

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

