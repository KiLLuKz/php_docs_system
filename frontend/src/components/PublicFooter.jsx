import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#ffffff]/10 py-12 px-4 bg-[#000000]">
      <div className="w-full px-6 lg:px-12 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#ffffff]/40" />
          <span className="text-[14px] font-medium text-[#ffffff]/40">Docsys © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-[12px] text-[#ffffff]/40 hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</Link>
          <Link to="/terms" className="text-[12px] text-[#ffffff]/40 hover:text-white transition-colors">ข้อกำหนดการใช้งาน</Link>
        </div>
      </div>
    </footer>
  );
}
