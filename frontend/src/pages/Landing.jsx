import React, { useEffect, useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Zap, Lock, Share2, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Beams from '../components/Beams';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function Landing() { 
  useDocumentTitle('Landing');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(() => {
    return localStorage.getItem('cookieConsent') !== 'true';
  });

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieConsent(false);
  };

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    {
      icon: <Lock size={32} className="text-[#2997ff]" />,
      title: "ระบบความปลอดภัยสูง",
      description: "ข้อมูลถูกเข้ารหัส 256-bit และจัดการสิทธิ์อย่างเคร่งครัด",
      colSpan: "md:col-span-2",
      bgClass: "bg-gradient-to-br from-[#1d1d1f] to-[#12223b]"
    },
    {
      icon: <Zap size={32} className="text-[#32d74b]" />,
      title: "ค้นหาฉับไว",
      description: "ค้นหาเอกสารได้ในเสี้ยววินาที ด้วย Fuzzy Search",
      colSpan: "md:col-span-1",
      bgClass: "bg-[#1d1d1f]"
    },
    {
      icon: <Share2 size={32} className="text-[#ffd60a]" />,
      title: "แชร์ได้อย่างง่ายดาย",
      description: "ส่งมอบเอกสารให้ทีมด้วยลิงก์พร้อมตั้งรหัสผ่าน",
      colSpan: "md:col-span-1",
      bgClass: "bg-[#1d1d1f]"
    },
    {
      icon: <ShieldCheck size={32} className="text-[#ff453a]" />,
      title: "ควบคุมการเข้าถึง",
      description: "จำกัดสิทธิ์การมองเห็นและดาวน์โหลดสำหรับแต่ละผู้ใช้ได้อย่างอิสระ",
      colSpan: "md:col-span-2",
      bgClass: "bg-gradient-to-tl from-[#1d1d1f] to-[#2a1312]"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.8 } }
  };

  if (loading) return <div className="min-h-screen bg-[#000000]"></div>;

  return (
    <div className="bg-[#000000] min-h-screen text-white overflow-hidden selection:bg-[#2997ff] selection:text-white font-[system-ui,-apple-system,sans-serif]">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-[200px] pb-[120px] px-4 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center max-w-[800px] w-full z-10"
        >
          <div className="mb-6">
            <motion.h1 
              variants={itemVariants}
              className="text-[42px] sm:text-[56px] md:text-[84px] font-bold tracking-tight leading-[1.05] text-white"
            >
              คลังเอกสาร
            </motion.h1>
            <motion.h1 
              variants={itemVariants}
              className="text-[42px] sm:text-[56px] md:text-[84px] font-bold tracking-tight leading-[1.05] text-white"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff] whitespace-nowrap">ที่ฉลาดและปลอดภัย</span>
            </motion.h1>
          </div>
          
          <motion.p 
            variants={itemVariants}
            className="text-[18px] md:text-[24px] font-normal tracking-wide leading-relaxed text-[#ffffff]/80 max-w-[650px] mx-auto mb-12"
          >
            ยกระดับการจัดการเอกสารในองค์กรของคุณ จัดเก็บ ค้นหา และแชร์ข้อมูลได้อย่างไร้รอยต่อ พร้อมระบบรักษาความปลอดภัยระดับองค์กร
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/login?tab=register')}
              className="bg-[#2997ff] text-white hover:bg-[#0071e3] px-8 py-4 rounded-full text-[18px] font-medium transition-all shadow-[0_0_20px_rgba(41,151,255,0.4)] hover:shadow-[0_0_30px_rgba(41,151,255,0.6)] active:scale-95 duration-200"
            >
              {user ? 'ไปที่แดชบอร์ด' : 'เริ่มต้นใช้งานฟรี'}
            </button>
            <button 
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#1d1d1f] border border-[#ffffff]/20 text-white hover:bg-[#272729] hover:border-[#ffffff]/40 px-8 py-4 rounded-full text-[18px] font-medium transition-all active:scale-95 duration-200"
            >
              ดูฟีเจอร์ทั้งหมด
            </button>
          </motion.div>
        </motion.div>
        
        {/* Beams Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60 flex items-center justify-center overflow-hidden">
          <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <Beams
              beamWidth={3}
              beamHeight={30}
              beamNumber={25}
              lightColor="#90abfe"
              speed={3}
              noiseIntensity={1.8}
              scale={0.2}
              rotation={45}
            />
          </div>
        </div>
      </section>

      {/* Interface Mockup Peek */}
      <section className="px-4 pb-32 flex justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", bounce: 0, duration: 1.2 }}
          className="w-full max-w-[1024px] bg-[#1d1d1f] rounded-[24px] border border-[#ffffff]/10 shadow-[0_40px_120px_rgba(41,151,255,0.15)] overflow-hidden flex flex-col"
        >
          {/* Mockup Header */}
          <div className="h-14 bg-[#2a2a2c] border-b border-[#ffffff]/10 flex items-center px-6 gap-3 shrink-0">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-inner"></div>
            </div>
            <div className="ml-8 flex-1 max-w-md hidden sm:flex items-center bg-[#1d1d1f] border border-[#ffffff]/10 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-[#ffffff]/40 mr-2" />
              <div className="text-[13px] text-[#ffffff]/40 font-light">ค้นหาเอกสาร... (⌘K)</div>
            </div>
            <div className="ml-auto flex items-center gap-3 hidden sm:flex">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2997ff] to-[#32d74b] flex items-center justify-center text-white text-[12px] font-bold">A</div>
            </div>
          </div>
          {/* Mockup Content Layout */}
          <div className="flex flex-1 h-[400px] sm:h-[500px] bg-[#1a1a1c]">
            {/* Sidebar */}
            <div className="w-48 sm:w-64 border-r border-[#ffffff]/10 p-4 hidden md:block">
              <div className="space-y-1">
                <div className="px-3 py-2 bg-[#2997ff]/10 text-[#2997ff] rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#2997ff]/20 flex items-center justify-center">📄</span> เอกสารทั้งหมด
                </div>
                <div className="px-3 py-2 text-[#ffffff]/60 hover:bg-[#ffffff]/5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <span className="w-4 h-4 rounded bg-[#32d74b]/20 flex items-center justify-center text-[#32d74b]">🛡️</span> เอกสารส่วนตัว
                </div>
                <div className="px-3 py-2 text-[#ffffff]/60 hover:bg-[#ffffff]/5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <span className="w-4 h-4 rounded bg-[#ffd60a]/20 flex items-center justify-center text-[#ffd60a]">⭐</span> รายการโปรด
                </div>
              </div>
            </div>
            {/* Main Area */}
            <div className="flex-1 p-6 sm:p-8 overflow-hidden flex flex-col">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-[24px] font-semibold text-white">เอกสารทั้งหมด</h3>
                  <p className="text-[#ffffff]/50 text-sm mt-1">รายการเอกสารอัปเดตล่าสุด</p>
                </div>
                <div className="h-9 w-32 bg-[#2997ff] rounded-lg opacity-80"></div>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { title: "Quarterly_Report_Q3.pdf", size: "2.4 MB", color: "text-[#ff453a]", bg: "bg-[#ff453a]/10" },
                  { title: "Design_System_Guidelines.fig", size: "15.2 MB", color: "text-[#a259ff]", bg: "bg-[#a259ff]/10" },
                  { title: "Employee_Handbook_2026.docx", size: "1.1 MB", color: "text-[#2997ff]", bg: "bg-[#2997ff]/10" },
                  { title: "Marketing_Budget.xlsx", size: "850 KB", color: "text-[#32d74b]", bg: "bg-[#32d74b]/10" }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-[#ffffff]/5 bg-[#252527] hover:bg-[#2a2a2c] hover:border-[#ffffff]/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                        <div className="w-5 h-5 bg-current rounded-sm opacity-50"></div>
                      </div>
                      <div>
                        <div className="text-white text-sm sm:text-base font-medium">{item.title}</div>
                        <div className="text-[#ffffff]/40 text-xs mt-0.5">{item.size} • อัปเดตเมื่อ 2 ชั่วโมงที่แล้ว</div>
                      </div>
                    </div>
                    <div className="hidden sm:flex w-24 h-6 bg-[#ffffff]/5 rounded-full"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 bg-[#000000]">
        <div className="max-w-[980px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-20"
          >
            <h2 className="text-[32px] md:text-[56px] font-bold tracking-tight leading-tight text-white mb-4">
              ดีไซน์ที่คิดมาเพื่อคุณ.
            </h2>
            <p className="text-[18px] md:text-[20px] text-[#ffffff]/80 font-light max-w-[600px] mx-auto leading-relaxed">
              สถาปัตยกรรมที่แข็งแกร่ง ประสิทธิภาพที่รวดเร็ว และประสบการณ์ที่ไร้รอยต่อ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.7, type: "spring" }}
                className={`rounded-[24px] p-8 border border-[#ffffff]/10 flex flex-col justify-between hover:border-[#ffffff]/20 transition-all duration-500 group relative overflow-hidden ${feature.colSpan} ${feature.bgClass}`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-transparent to-[#ffffff]/5 pointer-events-none"></div>
                
                <div className="relative z-10 mb-12 transform group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 origin-left">
                  <div className="w-14 h-14 rounded-2xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center backdrop-blur-sm shadow-xl">
                    {feature.icon}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-[20px] md:text-[24px] font-bold tracking-tight text-white mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-[15px] md:text-[17px] text-[#ffffff]/70 leading-relaxed font-normal">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
      
      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-[980px] mx-auto bg-[#1d1d1f]/90 backdrop-blur-2xl border border-[#ffffff]/10 rounded-[18px] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-2xl">
            <p className="text-[14px] md:text-[15px] font-normal tracking-wide leading-relaxed text-[#ffffff]/80 text-center md:text-left">
              เราใช้คุกกี้เพื่อเพิ่มประสบการณ์ที่ดีในการใช้งานเว็บไซต์ คุณสามารถอ่านรายละเอียดเพิ่มเติมได้ที่{' '}
              <Link to="/privacy" className="text-[#2997ff] hover:underline font-medium">นโยบายความเป็นส่วนตัว</Link> และ{' '}
              <Link to="/terms" className="text-[#2997ff] hover:underline font-medium">ข้อกำหนดการใช้งาน</Link>
            </p>
            <button 
              onClick={handleAcceptCookies}
              className="bg-[#2997ff] text-white hover:bg-[#0071e3] px-6 py-2.5 md:px-8 md:py-3 rounded-full text-[14px] md:text-[15px] font-medium transition-colors w-full md:w-auto whitespace-nowrap active:scale-95 duration-200"
            >
              ยอมรับคุกกี้
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
