"use client";

import { useEffect, useState } from "react";
import { Task } from "./types";
import AddTaskForm from "./AddTaskForm";
import Link from "next/link";



export default function TasksClient() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

    useEffect(() => {
        async function loadTasks() {
            try {
                const response = await fetch("/api/tasks");

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error);
                    return;
                }

                setTasks(data);

            } catch (error) {
                alert("Unable to load tasks.");
            } finally {
                setIsLoadingTasks(false);
            }
        }

        loadTasks();
    }, []);

    async function addTask(title: string) {
        setIsLoading(true);

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            setTasks(prevTasks => [...prevTasks, data]);

        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    async function completeTask(id: string) {
        const task = tasks.find(task => task.id === id);

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

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === id
                        ? { ...task, completed: data.completed }
                        : task
                )
            );

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

            setTasks(prevTasks =>
                prevTasks.filter(task => task.id !== id)
            );

        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setDeletingTaskId(null);
        }
    }

    return (
        <div>
            <AddTaskForm
                onAdd={addTask}
                isLoading={isLoading}
            />

            {isLoadingTasks && <p>Loading tasks...</p>}

            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <span>
                            <Link href={`/tasks/${task.id}`}>
                                {task.title}
                            </Link>
                        </span>

                        <span style={{ marginLeft: "30px" }}>
                            {task.completed ? "Completed" : "Pending"}
                        </span>
                        <button
                            style={{ marginLeft: "30px" }}
                            onClick={() => completeTask(task.id)}
                            disabled={updatingTaskId === task.id}
                        >
                            {updatingTaskId === task.id
                                ? "Updating..."
                                : task.completed
                                    ? "Undo"
                                    : "Complete"}
                        </button>

                        <button
                            style={{ marginLeft: "30px" }}
                            onClick={() => deleteTask(task.id)}
                            disabled={deletingTaskId === task.id}
                        >
                            {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}