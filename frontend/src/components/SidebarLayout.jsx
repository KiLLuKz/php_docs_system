import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Code, Users } from 'lucide-react';

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
          <footer className="py-6 mt-auto flex-shrink-0 flex items-center justify-center gap-4 text-[12px] text-[#ffffff]/40 border-t border-[#ffffff]/5">
            <span>Docsys © {new Date().getFullYear()}</span>
            <span>|</span>
            <Dialog>
              <DialogTrigger className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                <Users className="w-3.5 h-3.5" />
                รายชื่อผู้พัฒนา
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-[#1c1c1e] border-[#333333] text-white">
                <DialogHeader>
                  <DialogTitle>รายชื่อสมาชิกผู้พัฒนาระบบ</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { name: "นายสรวิชญ์ ศลีลาออน", num: "11" },
                    { name: "นายธาวิน ลาภสมบัติศิริ", num: "24" },
                    { name: "นายวีรภัฎ หุณฑะสิริ", num: "25" },
                    { name: "นายเอกราช ลุนณี", num: "27" },
                    { name: "นางสาวกาญจนา คชศิลา", num: "33" }
                  ].map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[#2a2a2c]/50 border border-[#333333]">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-white/50 text-sm">เลขที่ {member.num}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <span>|</span>
            <a 
              href="https://github.com/KiLLuKz/php_docs_system" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              Source Code
            </a>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
