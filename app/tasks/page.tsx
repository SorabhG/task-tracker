import { tasks } from "./data";
import TasksClient from "./TasksClient";

export default function TasksPage() {
    return (
        <main className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">
                My Task Tracker
            </h1>

            <TasksClient initialTasks={tasks} />
        </main>
    );
}