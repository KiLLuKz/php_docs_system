import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Code, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#ffffff]/10 py-12 px-4 bg-[#000000]">
      <div className="w-full px-6 lg:px-12 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#ffffff]/40" />
          <span className="text-[14px] font-medium text-[#ffffff]/40">Docsys © {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Dialog>
            <DialogTrigger className="text-[12px] text-[#ffffff]/40 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
              <Users size={14} />
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

          <a 
            href="https://github.com/KiLLuKz/php_docs_system" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[12px] text-[#ffffff]/40 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Code size={14} />
            Source Code
          </a>
        </div>
      </div>
    </footer>
  );
}
