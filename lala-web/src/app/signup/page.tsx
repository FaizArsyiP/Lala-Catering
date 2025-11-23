"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/header";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosInstance";
import { useState } from "react";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        password: "",
        confirmPassword: "",
        nomorTelepon: "",
        alamatPengiriman: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validasi password
        if (formData.password !== formData.confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post(`/users/register`, {
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
                nomorTelepon: formData.nomorTelepon,
                alamatPengiriman: formData.alamatPengiriman,
            });

            // Auto login setelah registrasi berhasil
            const loginRes = await api.post(`/users/login`, {
                email: formData.email,
                password: formData.password,
            });

            localStorage.setItem("token", loginRes.data.token);
            localStorage.setItem("user", JSON.stringify(loginRes.data.user));
            window.dispatchEvent(new Event("authStateChanged"));

            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-x-hidden w-screen min-h-screen bg-white flex justify-center items-center py-8">
            <div className="w-full h-full mx-[12vw]">
                {/* HEADER */}
                <div className="w-full">
                    <Header />
                </div>

                {/* PAGE CONTENT */}
                <div className="min-h-[calc(100vh-var(--header-height))] bg-white flex items-center justify-center py-8">
                    <div className="w-[84.531vw] flex items-center gap-8">
                        {/* LEFT SIDE - FORM */}
                        <div className="text-black w-1/2 flex flex-col justify-center gap-4 p-4">
                            <h1 className="text-5xl font-bold">Daftar Akun</h1>
                            <p className="text-xl mb-4">
                                Buat akun baru untuk mulai memesan menu favorit Anda.
                            </p>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Signup Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="nama" className="block text-sm font-medium mb-2">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        id="nama"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="nama@email.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="nomorTelepon" className="block text-sm font-medium mb-2">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        id="nomorTelepon"
                                        name="nomorTelepon"
                                        value={formData.nomorTelepon}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="08123456789"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="alamatPengiriman" className="block text-sm font-medium mb-2">
                                        Alamat Pengiriman
                                    </label>
                                    <textarea
                                        id="alamatPengiriman"
                                        name="alamatPengiriman"
                                        value={formData.alamatPengiriman}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        placeholder="Masukkan alamat lengkap untuk pengiriman"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                        Konfirmasi Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Ulangi password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? "Loading..." : "Daftar"}
                                </button>

                                <p className="text-center text-gray-600">
                                    Sudah punya akun?{" "}
                                    <Link href="/signin" className="text-orange-500 hover:underline font-semibold">
                                        Login di sini
                                    </Link>
                                </p>
                            </form>
                        </div>

                        {/* RIGHT SIDE - IMAGE */}
                        <div className="w-1/2 flex justify-center items-center">
                            <Image
                                src="/assets/login/Group 3.svg"
                                width={600}
                                height={600}
                                alt="signup pic"
                                className="h-[70vh] w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
