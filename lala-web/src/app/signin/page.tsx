"use client";

import Image from "next/image";
import Header from "@/components/layout/header";
import Link from "next/link";
import axios from "axios";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        try {
            const token = credentialResponse.credential;

            if (!token) {
                throw new Error("No token received from Google");
            }
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`,
                { token }
            );
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", JSON.stringify(res.data.user.id));
            window.dispatchEvent(new Event("authStateChanged"));
            router.push("/");
        } catch (error) {
            console.error("Google login error:", error);
        }
    };
    const handleGoogleFailure = () => {
        console.error("Google login failed");
    };
    return (
        <>
            <Header />
            <div className="min-h-[calc(100vh-160px)] bg-white flex items-center justify-center">
                <div className="w-[84.531vw] flex items-center ">
                    {/* LEFT SIDE */}
                    <div className="text-black w-1/2 flex flex-col  justify-center gap-4 p-4">
                        <h1 className="text-5xl font-bold ">
                            Welcome!
                        </h1>
                        <p className="text-2xl mb-4 w-[570px]">
                            Nikmati kemudahan memesan menu favorit setiap minggu
                            hanya dengan sekali login.
                        </p>

                        <div className=" self-center  ">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleFailure}
                                width="100%"
                                size="large"
                                theme="outline"
                                text="signin"
                            />
                        </div>
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
        </>
    );
}
