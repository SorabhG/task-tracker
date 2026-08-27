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
    

    function completeTask(id: string) {
        setTasks(
            tasks.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    }

    function deleteTask(id: string) {
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