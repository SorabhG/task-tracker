import { cookies } from "next/headers";
import { db } from "@/src/prisma/db";


export async function getCurrentUser() {
    const cookieStore = await cookies();

    console.log(
        "AUTH DEBUG - all cookies:",
        cookieStore.getAll().map(cookie => cookie.name)
    );

    const sessionId = cookieStore.get("sessionId")?.value;

    console.log("AUTH DEBUG - sessionId:", sessionId);
    if (!sessionId) {
        console.log("AUTH DEBUG - No session cookie");
        return null;
    }

    const session = await db.orm.public.Session
        .where({ id: sessionId })
        .first();

    console.log("AUTH DEBUG - session:", session);

    if (!session) {
        console.log("AUTH DEBUG - Session not found");
        return null;
    }

    console.log(
        "AUTH DEBUG - expiresAt:",
        session.expiresAt,
        "now:",
        new Date().toISOString()
    );

    if (new Date(session.expiresAt) < new Date()) {
        console.log("AUTH DEBUG - Session expired");
        return null;
    }

    const user = await db.orm.public.User
        .where({ id: session.userId })
        .first();

    console.log("AUTH DEBUG - user:", user);

    if (!user) {
        console.log("AUTH DEBUG - User not found");
        return null;
    }

    return user;
}

export async function requireCurrentUser() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    return user;
}