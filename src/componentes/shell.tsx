'use client'

import Sidebar from "@/componentes/sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
