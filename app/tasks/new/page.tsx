import Link from "next/link";


export default function NewTaskPage() {
    return (
        <main className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold">
                Create New Task
            </h1>

            <p className="mt-4">
                New task form will go here.
            </p>
            <Link href="/tasks">
                ← Back to Tasks
            </Link>
        </main>

    );
}