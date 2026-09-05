import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Zap, Lock, Share2, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Beams from '../components/Beams';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(true);

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
      icon: <Lock size={32} className="text-[#ffffff]" />,
      title: "ระบบความปลอดภัยสูง",
      description: "ข้อมูลทุกอย่างถูกเข้ารหัสและจัดการสิทธิ์อย่างเคร่งครัด เฉพาะผู้ที่ได้รับอนุญาตเท่านั้นที่สามารถเข้าถึงเอกสารได้"
    },
    {
      icon: <Zap size={32} className="text-[#ffffff]" />,
      title: "รวดเร็ว ไร้ความหน่วง",
      description: "ประสบการณ์ผู้ใช้ที่ลื่นไหลไร้รอยต่อ ค้นหาและดาวน์โหลดเอกสารได้ในเสี้ยววินาที ด้วยระบบค้นหาแบบ Fuzzy Search"
    },
    {
      icon: <Share2 size={32} className="text-[#ffffff]" />,
      title: "แชร์เอกสารอย่างง่ายดาย",
      description: "ส่งมอบเอกสารให้กับทีมของคุณด้วยการคลิกเพียงครั้งเดียว พร้อมระบบจำกัดสิทธิ์การมองเห็น"
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
          <motion.h1 
            variants={itemVariants}
            className="text-[56px] md:text-[80px] font-semibold tracking-[-0.04em] leading-[1.05] text-white mb-6"
          >
            จัดการเอกสาร.<br />
            <span className="text-[#ffffff]/50">ง่ายกว่าที่เคย.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-[21px] md:text-[24px] font-normal tracking-[0.231px] leading-relaxed text-[#ffffff]/60 max-w-[600px] mx-auto mb-12"
          >
            แพลตฟอร์มที่ช่วยให้คุณจัดเก็บ ค้นหา และแชร์เอกสารภายในองค์กรได้อย่างปลอดภัย รวดเร็ว และลื่นไหลในทุกอุปกรณ์
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex justify-center">
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/login?tab=register')}
              className="bg-[#0066cc] text-white hover:bg-[#0071e3] px-10 py-4 rounded-full text-[18px] font-medium tracking-tight transition-colors w-full sm:w-auto active:scale-95 duration-200"
            >
              {user ? 'ไปที่คลังเอกสาร' : 'เริ่มต้นใช้งาน'}
            </button>
          </motion.div>
        </motion.div>
        
        {/* Beams Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60 flex items-center justify-center overflow-hidden">
          <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <Beams
              beamWidth={3}
              beamHeight={30}
              beamNumber={20}
              lightColor="#c3c2ff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={30}
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
          className="w-full max-w-[980px] bg-[#1d1d1f] rounded-[24px] border border-[#ffffff]/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Mockup Header */}
          <div className="h-12 bg-[#2d2d2f] border-b border-[#ffffff]/10 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            <div className="ml-4 w-64 h-6 bg-[#000000]/50 rounded-md mx-auto flex items-center justify-center">
              <Search size={12} className="text-[#ffffff]/30 mr-2" />
              <div className="w-24 h-1.5 bg-[#ffffff]/20 rounded-full"></div>
            </div>
          </div>
          {/* Mockup Content */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#272729] rounded-[18px] border border-[#ffffff]/5 p-6 h-48 flex flex-col">
                <div className="w-8 h-8 rounded-md bg-[#2997ff]/20 mb-4"></div>
                <div className="w-3/4 h-3 bg-[#ffffff]/80 rounded-full mb-3"></div>
                <div className="w-full h-2 bg-[#ffffff]/20 rounded-full mb-2"></div>
                <div className="w-2/3 h-2 bg-[#ffffff]/20 rounded-full mb-auto"></div>
                <div className="w-1/3 h-2 bg-[#ffffff]/10 rounded-full"></div>
              </div>
            ))}
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
            className="text-center mb-20"
          >
            <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight text-white mb-4">
              ออกแบบมาเพื่อคุณ.
            </h2>
            <p className="text-[21px] text-[#ffffff]/60 font-light max-w-[600px] mx-auto">
              ประสิทธิภาพสูง ดีไซน์เรียบหรู และปลอดภัย
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-[#1d1d1f] rounded-[18px] p-8 border border-[#ffffff]/10 flex flex-col items-center text-center hover:bg-[#272729] transition-colors duration-500 group"
              >
                <div className="mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-[21px] font-semibold tracking-[0.231px] text-white mb-3">{feature.title}</h3>
                <p className="text-[17px] text-[#ffffff]/60 leading-[1.47] tracking-[-0.374px] font-normal">{feature.description}</p>
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
          <div className="max-w-[980px] mx-auto bg-[#1d1d1f]/90 backdrop-blur-2xl border border-[#ffffff]/10 rounded-[18px] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#ffffff]/80 text-center md:text-left">
              เราใช้คุกกี้เพื่อเพิ่มประสบการณ์ที่ดีในการใช้งานเว็บไซต์ คุณสามารถอ่านรายละเอียดเพิ่มเติมได้ที่{' '}
              <Link to="/privacy" className="text-[#2997ff] hover:underline font-medium">นโยบายความเป็นส่วนตัว</Link> และ{' '}
              <Link to="/terms" className="text-[#2997ff] hover:underline font-medium">ข้อกำหนดการใช้งาน</Link>
            </p>
            <button 
              onClick={() => setShowCookieConsent(false)}
              className="bg-[#0066cc] text-[#ffffff] hover:bg-[#0071e3] px-8 py-3 rounded-full text-[17px] font-medium transition-colors whitespace-nowrap active:scale-95 duration-200"
            >
              ยอมรับคุกกี้
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
