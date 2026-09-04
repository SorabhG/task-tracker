import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { registerSchema } from "@/src/validation/authSchemas";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";



export async function POST(request: Request) {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid login data" },
            { status: 400 }
        );
    }

    const { email, password } = result.data;

    const user = await db.orm.public.User
        .where({ email })
        .first();

    if (!user) {
        return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
        );
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
        );
    }

    const sessionId = randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const expiresAtString = expiresAt.toISOString();

    await db.orm.public.Session.create({
        id: sessionId,
        userId: user.id,
        expiresAt: expiresAtString,
    });

    const cookieStore = await cookies();

    console.log("AUTH LOGIN DEBUG - sessionId:", sessionId);
    console.log("AUTH LOGIN DEBUG - NODE_ENV:", process.env.NODE_ENV);
    console.log("AUTH LOGIN DEBUG - expiresAt:", expiresAtString);
    cookieStore.set("sessionId", sessionId, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === "production",
        secure: false, // Temporary: AWS is currently accessed over HTTP
        sameSite: "lax",
        expires: new Date(expiresAtString),
        path: "/",
    });

    return NextResponse.json({
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email,
        },
    });
}