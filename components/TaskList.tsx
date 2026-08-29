"use client";

import { Task } from "@/app/tasks/types";
import TaskItem from "@/components/TaskItem";

type Props = {
    tasks: Task[];
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    updatingTaskId: string | null;
    deletingTaskId: string | null;
};

export default function TaskList({
    tasks,
    onComplete,
    onDelete,
    updatingTaskId,
    deletingTaskId
}: Props) {
    return (
        <ul>
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    isUpdating={updatingTaskId === task.id}
                    isDeleting={deletingTaskId === task.id}
                />
            ))}
        </ul>
    );
}