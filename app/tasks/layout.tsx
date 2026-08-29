import Link from "next/link";

export default function TasksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section>
            <nav className="p-4 bg-gray-100">
                <Link href="/tasks">All Tasks</Link>{" | "}
                <Link href="/tasks/new">New Task</Link>
            </nav>

            {children}
        </section>
    );
}