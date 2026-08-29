import Link from "next/link";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function TaskPage({ params }: Props) {
    const { id } = await params;

    return (
        <main className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold">
                Task Details
            </h1>

            <p className="mt-4">
                Task ID: {id}
            </p>

            <Link href="/tasks">
                ← Back to Tasks
            </Link>
        </main>
    );
}