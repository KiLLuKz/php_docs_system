import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function Forbidden() { 
  useDocumentTitle('Forbidden');
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
          <div className="w-24 h-24 bg-[#ff3b30]/10 text-[#ff3b30] rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-[#ff3b30]/20 shadow-[0_0_40px_rgba(255,59,48,0.15)]">
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight mb-4 leading-tight">
            ไม่มีสิทธิ์เข้าถึง
          </h1>
          
          <p className="text-[17px] text-[#ffffff]/60 mb-10 font-light leading-relaxed">
            ขออภัย คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้ <br className="hidden md:block" />
            กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ หรือกลับไปหน้าหลัก
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#0066cc] text-white px-8 py-3 rounded-full text-[17px] font-medium hover:bg-[#0071e3] transition-colors active:scale-95 duration-200"
            >
              เข้าสู่ระบบ
            </button>
            <Link 
              to="/"
              className="border border-[#ffffff]/30 text-white px-8 py-3 rounded-full text-[17px] font-medium hover:bg-[#ffffff]/10 transition-colors active:scale-95 duration-200 flex items-center justify-center gap-2"
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
