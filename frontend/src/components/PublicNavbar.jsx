import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-2xl border-b ${
          isScrolled ? 'bg-[#1d1d1f]/70 border-[#ffffff]/10' : 'bg-[#1d1d1f]/30 border-[#ffffff]/5'
        }`}
      >
        <div className="w-full mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ShieldCheck size={24} className="text-[#2997ff]" />
            <span className="text-[17px] font-semibold tracking-[-0.374px]">DocPortal</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 items-center">
              <a href="/#features" className="text-[14px] font-normal tracking-[-0.224px] text-[#ffffff]/80 hover:text-white transition-colors">คุณสมบัติ</a>
              <Link to="/terms" className="text-[14px] font-normal tracking-[-0.224px] text-[#ffffff]/80 hover:text-white transition-colors">ข้อกำหนดการใช้งาน</Link>
              <Link to="/privacy" className="text-[14px] font-normal tracking-[-0.224px] text-[#ffffff]/80 hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</Link>
            </div>
            
            <div className="flex items-center gap-3 border-l border-[#ffffff]/20 pl-6">
              {user ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#0066cc] text-[#ffffff] px-5 py-1.5 rounded-full text-[14px] tracking-[-0.224px] font-medium hover:bg-[#0071e3] transition-colors active:scale-95 duration-200"
                >
                  เข้าสู่คลังเอกสาร
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/register')}
                    className="border border-[#ffffff]/30 text-white px-5 py-1.5 rounded-full text-[14px] tracking-[-0.224px] font-medium hover:bg-[#ffffff]/10 transition-colors active:scale-95 duration-200"
                  >
                    สมัครสมาชิก
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="bg-[#0066cc] text-[#ffffff] px-5 py-1.5 rounded-full text-[14px] tracking-[-0.224px] font-medium hover:bg-[#0071e3] transition-colors active:scale-95 duration-200"
                  >
                    เข้าสู่ระบบ
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white hover:text-[#2997ff] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-[#1d1d1f]/95 backdrop-blur-3xl border-b border-[#ffffff]/10 px-6 py-6 flex flex-col gap-6 absolute top-16 left-0 right-0 shadow-2xl"
          >
            <div className="flex flex-col gap-4 border-b border-[#ffffff]/10 pb-6">
              <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="text-[17px] font-medium tracking-[-0.374px] text-white">คุณสมบัติ</a>
              <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)} className="text-[17px] font-medium tracking-[-0.374px] text-white">ข้อกำหนดการใช้งาน</Link>
              <Link to="/privacy" onClick={() => setIsMobileMenuOpen(false)} className="text-[17px] font-medium tracking-[-0.374px] text-white">นโยบายความเป็นส่วนตัว</Link>
            </div>
            <div className="flex flex-col gap-3">
              {user ? (
                <button 
                  onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                  className="bg-[#0066cc] text-center w-full py-3 rounded-[12px] text-[17px] text-white font-medium active:scale-95 duration-200"
                >
                  เข้าสู่คลังเอกสาร
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                    className="border border-[#ffffff]/30 text-center w-full py-3 rounded-[12px] text-[17px] text-white font-medium active:scale-95 duration-200"
                  >
                    สมัครสมาชิก
                  </button>
                  <button 
                    onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                    className="bg-[#0066cc] text-center w-full py-3 rounded-[12px] text-[17px] text-white font-medium active:scale-95 duration-200"
                  >
                    เข้าสู่ระบบ
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </>
  );
}
