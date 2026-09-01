import Panel from "@/components/Panel";
import TasksClient from "./TasksClient";
import { getTasksForUser } from "@/src/tasks";
import { getCurrentUser } from "@/src/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import ServerActionDemo from "@/components/ServerActionDemo";

export default async function TasksPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }
    console.log("got Task for User from Server Page", user);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tasks = await getTasksForUser(user.id);

    return (
        <Panel>
            <h2>My Tasks</h2>

            <TasksClient initialTasks={tasks} />
            <LogoutButton/>

        </Panel>
    );
}