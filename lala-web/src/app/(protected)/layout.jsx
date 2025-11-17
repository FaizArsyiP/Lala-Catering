"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/signin"); // replace biar ga bisa back
        } else {
            setIsChecking(false); // sudah cek dan token valid
        }
    }, [router]);

    if (isChecking) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-gray-500">Checking authentication...</p>
            </div>
        );
    }

    return <>{children}</>;
}
