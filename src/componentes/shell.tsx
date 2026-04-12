'use client'

import { usePathname } from "next/navigation";
import Sidebar from "@/componentes/sidebar";
import { Toaster } from "sonner";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenSidebarRoutes = ["/login", "/error", "/auth"];
  const isLoginPage = hiddenSidebarRoutes.includes(pathname);

  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 overflow-y-auto">
        {children}
        <Toaster richColors position="top-right" />
      </main>
    </div>
  );
}
