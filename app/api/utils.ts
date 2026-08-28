import { NextResponse } from "next/server";
import { z } from "zod";

export async function parseJsonBody<T extends z.ZodType>(
    request: Request,
    schema: T
): Promise<
    | { success: true; data: z.infer<T> }
    | { success: false; response: NextResponse }
> {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return {
            success: false,
            response: NextResponse.json(
                { error: "Invalid JSON request body." },
                { status: 400 }
            ),
        };
    }

    const result = schema.safeParse(body);

    if (!result.success) {
        return {
            success: false,
            response: NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            ),
        };
    }

    return {
        success: true,
        data: result.data,
    };
}