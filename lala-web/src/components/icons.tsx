// components/icons.tsx

// Ikon comotan dari w3.org (versi lu)
export const IconUser = ({
    className = "w-5 h-5 text-slate-700",
}: {
    className?: string;
}) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
            fill="#334155"
        />
        <path
            d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z"
            fill="#94A3B8"
        />
    </svg>
);

export const IconSearch = ({
    className = "w-4 h-4",
}: {
    className?: string;
}) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
            d="M21 21l-4.35-4.35"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="11" cy="11" r="6" stroke="#94A3B8" strokeWidth="1.5" />
    </svg>
);

export const IconDish = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
            d="M3 12h18"
            stroke="#64748B"
            strokeWidth="1.2"
            strokeLinecap="round"
        />
        <path
            d="M6 12c0-3 2-5 6-5s6 2 6 5v3H6v-3z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1"
        />
    </svg>
);