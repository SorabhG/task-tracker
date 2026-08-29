type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
};

export default function Button({
    children,
    onClick,
    disabled
}: Props) {
    return (
        <button className="ml-[100px] rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-500"
            onClick={onClick}
            disabled={disabled}

        >
            {children}
        </button>
    );
}