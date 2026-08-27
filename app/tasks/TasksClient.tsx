"use client";

import { useState } from "react";
import { Task } from "./types";
import AddTaskForm from "./AddTaskForm";

type Props = {
    initialTasks: Task[];
};

export default function TasksClient({ initialTasks }: Props) {
    const [tasks, setTasks] = useState(initialTasks);

    // function addTask(title: string) {
    //     const newTask: Task = {
    //         id: Date.now(),
    //         title: title,
    //         completed: false
    //     };

    //     setTasks([...tasks, newTask]);
    // }

    async function addTask(title: string) {
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
        setTasks([...tasks, data]);
    }


    async function completeTask(id: string) {

        const task = tasks.find(task => task.id === id);

        if (!task) return;

        const newCompleted = !task.completed;

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


        setTasks(
            tasks.map(task =>
                task.id === id
                    ? { ...task, completed: data.completed }
                    : task
            )
        );
    }

    async function deleteTask(id: string) {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }
        setTasks(
            tasks.filter(task => task.id !== id)
        );
    }

    return (
        <div>
            <AddTaskForm onAdd={addTask} />

            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <span>
                            {task.title}
                        </span>

                        <span style={{ marginLeft: "20px" }}>
                            {task.completed ? "Completed" : "Pending"}
                        </span>

                        <button
                            style={{ marginLeft: "20px" }}
                            onClick={() => completeTask(task.id)}
                        >
                            {task.completed ? "Undo" : "Complete"}
                        </button>

                        <button
                            style={{ marginLeft: "10px" }}
                            onClick={() => deleteTask(task.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}