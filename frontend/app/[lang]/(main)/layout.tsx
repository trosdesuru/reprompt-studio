"use client";

import { Navbar } from "@/src/system/organisms/Navbar/Navbar";
import { FadeIn } from "@/src/system/atoms/FadeIn";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <FadeIn>{children}</FadeIn>
    </>
  );
}
