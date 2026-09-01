import { db } from "@/src/prisma/db";

export async function getTasksForUser(userId: string) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    return db.orm.public.Task
        .where({ userId })
         .orderBy(task => task.createdAt.desc())
        .all();
        
}