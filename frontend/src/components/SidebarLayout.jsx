import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Settings, LogOut, Menu, ShieldCheck, UserCircle, UploadCloud, ChevronLeft, ChevronRight, Users, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsOpen(false);
      } else {
        setIsMobile(false);
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FileText, label: 'คลังเอกสารของฉัน' },
    { path: '/manage', icon: UploadCloud, label: 'จัดการเอกสาร' },
    { path: '/profile', icon: UserCircle, label: 'ข้อมูลส่วนตัว' },
    ...(user?.role === 'admin' ? [{ path: '/admin/users', icon: Users, label: 'จัดการผู้ใช้งาน' }] : [])
  ];

  const sidebarVariants = {
    open: { width: isMobile ? '288px' : '288px', x: 0 },
    closed: { width: isMobile ? '288px' : '80px', x: isMobile ? '-100%' : 0 },
  };

  return (
    <div className="flex h-screen bg-[#000000] overflow-hidden">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={`fixed lg:relative z-50 h-full bg-[#1d1d1f] border-r border-hairline flex flex-col ${isMobile && !isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
      >
        {/* Header / Logo */}
        <div className={`h-20 flex items-center ${isOpen || isMobile ? 'justify-between px-4' : 'justify-center'} border-b border-[#ffffff]/10 flex-shrink-0 transition-all duration-300`}>
          <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap ${!isOpen && !isMobile ? 'hidden' : 'flex'}`}>
            <div className="w-10 h-10 rounded-full bg-[#0066cc] text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <motion.div
              animate={{ opacity: isOpen || isMobile ? 1 : 0, width: isOpen || isMobile ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-semibold text-[21px] tracking-tight leading-none text-white">DocPortal</h2>
            </motion.div>
          </div>
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full hover:bg-[#ffffff]/10 flex items-center justify-center text-[#ffffff]/70 hover:text-white transition-colors flex-shrink-0"
          >
            {isMobile ? <Menu size={20} /> : (isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />)}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink 
                key={item.path}
                to={item.path} 
                className={`relative flex items-center ${isOpen || isMobile ? 'gap-4 px-3 w-full' : 'justify-center w-12 mx-auto px-0'} h-12 rounded-[14px] transition-all duration-200 group ${
                  isActive 
                    ? 'text-[#2997ff]' 
                    : 'text-[#ffffff]/60 hover:bg-[#ffffff]/5 hover:text-white'
                }`}
                title={!isOpen && !isMobile ? item.label : undefined}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-[#2997ff]/10 rounded-[14px]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-center w-6 h-6 flex-shrink-0">
                  <Icon size={22} className={isActive ? 'text-[#2997ff]' : ''} />
                </div>
                <motion.span 
                  animate={{ 
                    opacity: isOpen || isMobile ? 1 : 0, 
                    width: isOpen || isMobile ? 'auto' : 0,
                    display: isOpen || isMobile ? 'block' : 'none'
                  }}
                  className="relative z-10 text-[17px] font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </NavLink>
            );
          })}
          
          {/* Home Button (Bottom of Nav) */}
          <div className="mt-auto pt-4">
            <button 
              onClick={() => navigate('/')}
              className={`relative flex items-center ${isOpen || isMobile ? 'gap-4 px-3 w-full' : 'justify-center w-12 mx-auto px-0'} h-12 rounded-[14px] transition-all duration-200 group text-[#ffffff]/60 hover:bg-[#ffffff]/5 hover:text-white`}
              title={!isOpen && !isMobile ? "กลับไปหน้าหลัก" : undefined}
            >
              <div className="relative z-10 flex items-center justify-center w-6 h-6 flex-shrink-0">
                <Home size={22} />
              </div>
              <motion.span 
                animate={{ 
                  opacity: isOpen || isMobile ? 1 : 0, 
                  width: isOpen || isMobile ? 'auto' : 0,
                  display: isOpen || isMobile ? 'block' : 'none'
                }}
                className="relative z-10 text-[17px] font-medium whitespace-nowrap overflow-hidden text-left"
              >
                กลับไปหน้าหลัก
              </motion.span>
            </button>
          </div>
        </div>

        {/* Footer / User Profile */}
        <div className={`p-4 border-t border-[#ffffff]/10 flex-shrink-0 transition-all duration-300 ${!isOpen && !isMobile ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${isOpen || isMobile ? 'gap-3' : 'justify-center'} overflow-hidden whitespace-nowrap w-full`}>
            <div className="w-10 h-10 rounded-full bg-[#000000] border border-[#ffffff]/10 flex items-center justify-center flex-shrink-0 text-white">
              <span className="uppercase text-[14px] font-semibold">{user?.username?.substring(0, 2)}</span>
            </div>
            <motion.div 
              animate={{ 
                opacity: isOpen || isMobile ? 1 : 0, 
                width: isOpen || isMobile ? 'auto' : 0,
                display: isOpen || isMobile ? 'block' : 'none'
              }}
              className="flex-1 overflow-hidden"
            >
              <p className="text-[14px] font-semibold truncate text-white">{user?.full_name}</p>
              <p className="text-[12px] text-[#ffffff]/50 truncate capitalize">{user?.role}</p>
            </motion.div>
            <motion.button 
              animate={{ 
                opacity: isOpen || isMobile ? 1 : 0,
                display: isOpen || isMobile ? 'flex' : 'none'
              }}
              onClick={handleLogout}
              className="w-8 h-8 rounded-full hover:bg-[#ff3b30]/20 text-[#ffffff]/50 hover:text-[#ff3b30] flex items-center justify-center transition-colors flex-shrink-0"
              title="ออกจากระบบ"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        {isMobile && (
          <div className="h-16 bg-[#000000]/80 backdrop-blur-md border-b border-hairline flex items-center px-4 flex-shrink-0 z-30 sticky top-0">
            <button 
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 rounded-full hover:bg-[#ffffff]/10 flex items-center justify-center text-white"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 text-center font-semibold text-[17px]">DocPortal</div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        )}
        
        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <footer className="py-6 mt-8 flex-shrink-0 text-center text-[12px] text-[#ffffff]/30 border-t border-[#ffffff]/5">
            DocPortal © {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
