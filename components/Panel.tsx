type Props = {
    children: React.ReactNode;
};

export default function Panel({ children }: Props) {
    return (
        <div className="border rounded-lg p-4">
            {children}
        </div>
    );
}