import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/src/prisma/db";
import { registerSchema } from "@/src/validation/authSchemas";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid registration data" },
            { status: 400 }
        );
    }

    const { email, password } = result.data;

    const existingUser = await db.orm.public.User
        .where({ email })
        .first();

    if (existingUser) {
        return NextResponse.json(
            { error: "User already exists" },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.orm.public.User.create({
        id: randomUUID(),
        email,
        passwordHash,
    });

    return NextResponse.json(
        {
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email,
            },
        },
        { status: 201 }
    );
}