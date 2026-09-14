import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useNavigate, Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function NotFound() { 
  useDocumentTitle('NotFound');
  const navigate = useNavigate();

  return (
    <div className="bg-[#000000] min-h-screen text-white font-[system-ui,-apple-system,sans-serif] flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 flex items-center justify-center p-6 mt-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-[#ffcc00]/10 text-[#ffcc00] rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-[#ffcc00]/20 shadow-[0_0_40px_rgba(255,204,0,0.15)]">
            <FileQuestion size={48} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight mb-4 leading-tight">
            ไม่พบหน้าที่ต้องการ
          </h1>
          
          <p className="text-[17px] text-[#ffffff]/60 mb-10 font-light leading-relaxed">
            หน้าเว็บที่คุณพยายามเข้าถึงอาจถูกลบไปแล้ว <br className="hidden md:block" />
            หรือลิงก์ที่คุณเข้ามาอาจไม่ถูกต้อง
          </p>
          
          <div className="flex justify-center">
            <Link 
              to="/"
              className="bg-[#0066cc] text-white px-8 py-3 rounded-full text-[17px] font-medium hover:bg-[#0071e3] transition-colors active:scale-95 duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              กลับหน้าแรก
            </Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
