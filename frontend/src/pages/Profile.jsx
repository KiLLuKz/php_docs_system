import React from 'react';
import { UserCircle, Mail, Briefcase, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="w-full bg-[#000000] min-h-screen text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-[1440px] pt-12 md:pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-[40px] font-semibold tracking-tight text-center mb-12">บัญชีของคุณ</h1>
          
          <div className="bg-[#272729] rounded-[18px] p-8 md:p-12 border border-hairline/50 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <UserCircle size={64} strokeWidth={1.5} />
              </div>
              
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <p className="text-[14px] text-[#ffffff]/50 uppercase tracking-wider font-semibold mb-1">ชื่อ-นามสกุล</p>
                  <p className="text-[21px] font-semibold">{user?.full_name}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 bg-[#000000]/30 p-4 rounded-[11px]">
                    <Mail className="text-[#ffffff]/50" size={20} />
                    <div>
                      <p className="text-[12px] text-[#ffffff]/50">อีเมล</p>
                      <p className="text-[17px]">{user?.email || 'ไม่มีข้อมูล'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#000000]/30 p-4 rounded-[11px]">
                    <Briefcase className="text-[#ffffff]/50" size={20} />
                    <div>
                      <p className="text-[12px] text-[#ffffff]/50">ตำแหน่ง / สิทธิ์</p>
                      <p className="text-[17px] capitalize">{user?.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#000000]/30 p-4 rounded-[11px] md:col-span-2">
                    <Hash className="text-[#ffffff]/50" size={20} />
                    <div>
                      <p className="text-[12px] text-[#ffffff]/50">ชื่อผู้ใช้งาน (Username)</p>
                      <p className="text-[17px]">{user?.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
