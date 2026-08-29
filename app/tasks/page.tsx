import Panel from "@/components/Panel";
import TasksClient from "./TasksClient";

export default function TasksPage() {
    return (
        <Panel>
            <h2>My Tasks</h2>

            <TasksClient />
        </Panel>
    );
}