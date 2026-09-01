"use client";

import { sayHello } from "@/src/actions/demo";

export default function ServerActionDemo() {
    async function handleClick() {
        const result = await sayHello("Sam");

        console.log("Result from server:", result);
    }

    return (
        <button onClick={handleClick}>
            Call Server Action
        </button>
    );
}