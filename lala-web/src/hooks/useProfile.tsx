"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export type UserProfile = {
    nama: string;
    nomorTelepon: string;
    email: string;
    alamatPengiriman: string;
    _id: string;
};
    
export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
            headers: {
                "x-auth-token": token,
            },
        })
        .then(response => {
            setProfile(response.data);
        })
        .catch(error => {
            console.error("Failed to fetch profile:", error);
            setProfile(null);
        });
    }, []);

    return profile;
}