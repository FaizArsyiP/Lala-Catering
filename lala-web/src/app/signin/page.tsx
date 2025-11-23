"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/header";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosInstance";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState<"traditional" | "google">("traditional");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTraditionalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post(`/users/login`, { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            window.dispatchEvent(new Event("authStateChanged"));

            if (res.data.user.role === "penjual") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login gagal. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        try {
            const token = credentialResponse.credential;

            if (!token) {
                throw new Error("No token received from Google");
            }
            const res = await api.post(`/users/auth/google`, { token });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            window.dispatchEvent(new Event("authStateChanged"));

            // Cek apakah profile perlu dilengkapi (khusus Google login)
            const user = res.data.user;
            const needsProfileCompletion =
                user.nomorTelepon === "000000000" ||
                user.alamatPengiriman === "MUST_UPDATE_PROFILE" ||
                !user.alamatPengiriman;

            if (needsProfileCompletion) {
                // Redirect ke profile dengan flag untuk complete profile
                router.push("/profile?complete=true");
                return;
            }

            if (res.data.user.role === "penjual") {
                router.push("/admin");
                return;
            }else{
                router.push("/");
            }
        } catch (error) {
            console.error("Google login error:", error);
            setError("Login dengan Google gagal.");
        }
    };
    const handleGoogleFailure = () => {
        console.error("Google login failed");
        setError("Login dengan Google gagal.");
    };
    return (
        <div className="overflow-x-hidden w-screen h-screen bg-white flex justify-center items-center">

            <div className="w-full h-full mx-[12vw]">

                {/* HEADER */}
                <div className="w-full">
                    <Header />
                </div>

                {/* PAGE CONTENT */}
                <div className="h-[calc(100vh-var(--header-height))] bg-white flex items-center justify-center">
                <div className="w-[84.531vw] flex items-center ">
                    {/* LEFT SIDE */}
                    <div className="text-black w-1/2 flex flex-col  justify-center gap-4 p-4">
                        <h1 className="text-5xl font-bold ">Welcome!</h1>
                        <p className="text-2xl mb-4 w-[570px]">
                            Nikmati kemudahan memesan menu favorit setiap minggu
                            hanya dengan sekali login.
                        </p>

                        {/* Login Method Toggle */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setLoginMethod("traditional")}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                    loginMethod === "traditional"
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Email & Password
                            </button>
                            <button
                                onClick={() => setLoginMethod("google")}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                    loginMethod === "google"
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Google
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Traditional Login Form */}
                        {loginMethod === "traditional" && (
                            <form onSubmit={handleTraditionalLogin} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="nama@email.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Loading..." : "Login"}
                                </button>
                                <p className="text-center text-gray-600">
                                    Belum punya akun?{" "}
                                    <Link href="/signup" className="text-orange-500 hover:underline font-semibold">
                                        Daftar di sini
                                    </Link>
                                </p>
                            </form>
                        )}

                        {/* Google Login */}
                        {loginMethod === "google" && (
                            <div className="self-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleFailure}
                                    width="100%"
                                    size="large"
                                    theme="outline"
                                    text="signin"
                                />
                            </div>
                        )}
                    </div>
                    {/* IMAGE */}
                    <div className=" w-1/2 flex justify-center items-center">
                        <Image
                            src="/assets/login/Group 3.svg"
                            width={600}
                            height={600}
                            alt="login pic"
                            className="h-[70vh] w-full object-contain "
                        />
                    </div>
                </div>
                </div>

            </div>

        </div>
    );
}
