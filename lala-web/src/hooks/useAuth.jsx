"use client";

import { useState, useEffect } from "react";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("user");

        if (userData) {
            setUser(JSON.parse(userData));
        }

        setLoading(false);
    }, []);

    return { user, loading };
}
