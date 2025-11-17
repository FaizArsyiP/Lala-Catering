"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from '@/context/CartContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                {children}
            </GoogleOAuthProvider>
        </CartProvider>
    );
}
