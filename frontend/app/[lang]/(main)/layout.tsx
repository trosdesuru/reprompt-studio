// src/app/[lang]/(main)/layout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Navbar } from "@/src/system/organisms/Navbar/Navbar";
import { FadeIn } from "@/src/system/atoms/FadeIn";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Navbar />
      <FadeIn>{children}</FadeIn>
    </>
  );
}
