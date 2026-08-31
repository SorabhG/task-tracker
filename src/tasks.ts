import { db } from "@/src/prisma/db";

export async function getTasksForUser(userId: string) {
    return db.orm.public.Task
        .where({ userId })
        .all();
        
}