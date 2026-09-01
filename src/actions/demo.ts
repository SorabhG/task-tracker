"use server";

export async function sayHello(name: string) {
    console.log("Server Action received:", name);

    return `Hello ${name}`;
}