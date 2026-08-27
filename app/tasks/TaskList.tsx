import { tasks } from "./data";

export default function TaskList() {
    return (
        <ul className="space-y-3">
            {tasks.map(task => (
                <li
                    key={task.id}
                    className="border rounded-lg p-4 flex justify-between"
                >
                    <span>{task.title}</span>

                    <span>
                        {task.completed ? "Completed" : "Pending"}
                    </span>
                </li>
            ))}
        </ul>
    );
}