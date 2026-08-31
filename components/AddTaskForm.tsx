"use client";

import { useState } from "react";
import Button from "./Button";

type Props = {
    onAdd: (title: string) => Promise<boolean>;
    isLoading: boolean;
};

export default function AddTaskForm(props: Props) {
    //destructuring example function AddTaskForm({ onAdd }: Props)
    const [title, setTitle] = useState("");

    async function handleAdd() {
        const success = await props.onAdd(title);

        if (success) {
            setTitle("");
        }
    }





    return (
        <div>
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter task"
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