import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';

const SidebarLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#000000]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 px-4 bg-black/60 backdrop-blur-xl sticky top-0 z-30">
          <SidebarTrigger className="-ml-1 text-white/70 hover:text-white" />
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
          <footer className="py-6 mt-auto flex-shrink-0 text-center text-[12px] text-[#ffffff]/30 border-t border-[#ffffff]/5">
            Docsys © {new Date().getFullYear()}
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
