"use client";

import { useState } from "react";
import Button from "./Button";

type Props = {
    onAdd: (title: string) => void;
    isLoading: boolean;
};

export default function AddTaskForm(props: Props) {
    //destructuring example function AddTaskForm({ onAdd }: Props)
    const [title, setTitle] = useState("");

    function handleAdd() {
        //destructuring example onAdd(title);
        props.onAdd(title);
        setTitle("");
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
                {props.isLoading ? "Adding..." : "Add Task"}
            </Button>
        </div>
    );
}