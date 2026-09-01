import { cookies } from "next/headers";
import { db } from "@/src/prisma/db";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();

    const sessionId = cookieStore.get("sessionId")?.value;

    if (sessionId) {
        await db.orm.public.Session
            .where({ id: sessionId })
            .delete();
    }

    cookieStore.delete("sessionId");

    return NextResponse.json({
        message: "Logged out successfully"
    });
}