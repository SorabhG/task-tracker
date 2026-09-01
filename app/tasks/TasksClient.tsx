"use client";

import TaskItem from "@/components/TaskItem";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AddTaskForm from "../../components/AddTaskForm";
import { Task } from "./types";
import { createTask } from "@/src/actions/tasks";

type Props = {
    initialTasks: Task[];
};

export default function TasksClient({ initialTasks }: Props) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

async function addTask(title: string) {
    setIsLoading(true);
    setError(null);

    try {
        const result = await createTask(title);

        if (!result.success) {
            setError(result.error ?? "Something went wrong.");
            return false;
        }

        router.refresh();
        return true;

    } catch (error) {
        setError("Something went wrong. Please try again.");
        return false;
    } finally {
        setIsLoading(false);
    }
}

   async function completeTask(id: string) {
    const task = initialTasks.find(task => task.id === id);

    if (!task) return;

    const newCompleted = !task.completed;

    setUpdatingTaskId(id);

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                completed: newCompleted
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        router.refresh();

    } catch (error) {
        alert("Something went wrong. Please try again.");
    } finally {
        setUpdatingTaskId(null);
    }
}

    async function deleteTask(id: string) {
        setDeletingTaskId(id);

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            router.refresh();

        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setDeletingTaskId(null);
        }
    }

    return (
        <div>
            {error && (
                <p>
                    {error}
                </p>
            )}
            <AddTaskForm
                onAdd={addTask}
                isLoading={isLoading}
            />



            <ul>
                {initialTasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        onDelete={deleteTask}
                        isUpdating={updatingTaskId === task.id}
                        isDeleting={deletingTaskId === task.id}
                    />
                ))}
            </ul>
        </div>
    );
}