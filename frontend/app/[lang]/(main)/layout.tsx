"use client";

import { Navbar } from "@/src/system/organisms/Navbar/Navbar";
import { FadeIn } from "@/src/system/atoms/Animations/FadeIn";
import { Footer } from "@/src/system/organisms/Navigation/Footer";
import { useFeedbackTrigger } from "@/src/features/feedback/hooks/useFeedbackTrigger";
import { FeedbackBetaModal } from "@/src/features/feedback/components/FeedbackBetaModal";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { showFeedbackModal, snoozeFeedback, completeFeedback } = useFeedbackTrigger();
  return (
    <>
      <Navbar />
      <FadeIn>{children}</FadeIn>
      <Footer />
      <FeedbackBetaModal
        isOpen={showFeedbackModal}
        onClose={snoozeFeedback}
        onComplete={completeFeedback}
      />
    </>
  );
}
