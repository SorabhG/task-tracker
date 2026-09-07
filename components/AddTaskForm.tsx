"use client";

import { useState } from "react";
import Button from "./Button";

type Props = {
    onAdd: (input: {
        title: string;
        dueDate: string | null;
    }) => Promise<boolean>;
    isLoading: boolean;
};

export default function AddTaskForm(props: Props) {
    //destructuring example function AddTaskForm({ onAdd }: Props)
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");

    async function handleAdd() {
        const success = await props.onAdd({
            title,
            dueDate: dueDate || null,
        });

        if (success) {
            setTitle("");
            setDueDate("");
        }
    }

    return (
        <div>
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter task"
            />

            <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
            />

            <Button
                onClick={handleAdd}
                disabled={props.isLoading}
            >
                {props.isLoading ? "⏳ Adding..." : "Add Task"}
            </Button>
        </div>
    );
}