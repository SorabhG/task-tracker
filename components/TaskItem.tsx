type Task = {
    id: string;
    title: string;
    completed: boolean;
};

type Props = {
    task: Task;
};

export default function TaskItem({ task }: Props) {
    return (
        <div>
            <h3>{task.title}</h3>
            <p>{task.completed ? "Completed" : "Pending"}</p>
        </div>
    );
}