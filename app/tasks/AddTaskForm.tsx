"use client";

import { useState } from "react";

type Props = {
    onAdd: (title: string) => void;
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

            <button onClick={handleAdd}>
                Add Task
            </button>
        </div>
    );
}