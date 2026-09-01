"use client";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        router.push("/login");
        router.refresh();
    }

    return (
        <Button onClick={handleLogout}>
            Sign out
        </Button>
    );
}