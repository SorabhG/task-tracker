import Panel from "@/components/Panel";
import TasksClient from "./TasksClient";
import { getTasksForUser } from "@/src/tasks";
import { getCurrentUser } from "@/src/auth";
import { redirect } from "next/navigation";


export default async function TasksPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }
    console.log("got Task for User from Server Page", user);
    const tasks = await getTasksForUser(user.id);

    return (
        <Panel>
            <h2>My Tasks</h2>

            <TasksClient initialTasks={tasks} />
        </Panel>
    );
}