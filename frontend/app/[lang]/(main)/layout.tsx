import { Navbar } from "@/src/system/organisms/Layout/Navbar/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
