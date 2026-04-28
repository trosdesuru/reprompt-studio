"use client";

import { Navbar } from "@/src/system/organisms/Navbar/Navbar";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";
import { Footer } from "@/src/system/molecules/Navigation/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <FadeIn>{children}</FadeIn>
      <Footer />
    </>
  );
}
