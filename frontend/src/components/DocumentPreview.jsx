import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Calendar, HardDrive, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from './ui/avatar';

export default function DocumentPreview({ document, isOpen, onClose, onDownload }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!document) return null;

  const ext = document.file_path ? document.file_path.split('.').pop().toLowerCase() : 'pdf';
  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  const previewUrl = `${baseUrl}/documents/preview/${document.id}?token=${token}`;

  let previewContent;
  if (['png', 'jpg', 'jpeg'].includes(ext)) {
    previewContent = <img src={previewUrl} alt={document.title} className="w-full h-full object-contain p-4" />;
  } else if (ext === 'pdf') {
    previewContent = <iframe src={previewUrl} className="w-full h-full border-none bg-white rounded-l-[18px]" title={document.title} />;
  } else {
    previewContent = (
      <div className="flex flex-col items-center opacity-60">
        <FileText size={80} className="mb-4 text-[#2997ff]" />
        <p className="text-[14px] uppercase tracking-wider text-center">
          ไม่รองรับการพรีวิวสำหรับไฟล์ {ext.toUpperCase()}
          <br />
          <span className="text-[12px] mt-2 block opacity-70">กรุณาดาวน์โหลดเพื่อเปิดอ่าน</span>
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="bg-[#1d1d1f] w-full max-w-3xl rounded-[18px] border border-hairline/50 overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row h-auto max-h-[85vh]"
          >
            {/* Left side: Preview Placeholder */}
            <div className="w-full md:w-[45%] bg-[#000000] border-r border-hairline/30 flex items-center justify-center shrink-0">
              {previewContent}
            </div>

            {/* Right side: Details */}
            <div className="flex-1 p-8 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#d2d2d7]/10 border border-[#d2d2d7]/20 rounded-full text-[12px] font-medium text-[#ffffff]/70 mb-4">
                    {document.category_name || 'ทั่วไป'}
                  </span>
                  <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-white">{document.title}</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#ffffff]/10 flex items-center justify-center hover:bg-[#ffffff]/20 transition-colors shrink-0"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-[17px] text-[#ffffff]/60 leading-relaxed font-light">
                  {document.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 col-span-2">
                  <div className="w-10 h-10 rounded-full bg-[#d2d2d7]/5 flex items-center justify-center">
                    <User size={18} className="text-[#ffffff]/50" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[12px] text-[#ffffff]/40">ผู้สร้าง</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={document.creator_profile_image ? `/api/uploads/profiles/${document.creator_profile_image}` : ''} />
                        <AvatarFallback>{(document.creator_name || document.creator_username || '?').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-[14px] font-medium text-[#ffffff]/80">
                        {document.creator_name || document.creator_username} {document.created_by == user?.id && '(คุณ)'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d2d2d7]/5 flex items-center justify-center">
                    <Calendar size={18} className="text-[#ffffff]/50" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#ffffff]/40">วันที่อัปโหลด</p>
                    <p className="text-[14px] font-medium text-[#ffffff]/80">{new Date(document.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d2d2d7]/5 flex items-center justify-center">
                    <HardDrive size={18} className="text-[#ffffff]/50" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#ffffff]/40">ขนาดไฟล์</p>
                    <p className="text-[14px] font-medium text-[#ffffff]/80">{document.file_size}</p>
                  </div>
                </div>
                
                <div className="col-span-2 bg-[#d2d2d7]/5 p-4 rounded-xl border border-white/5 mt-2">
                  <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">สิทธิ์การเข้าถึงและการแชร์</h3>
                  {document.is_public == 1 ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">เอกสารสาธารณะ</p>
                        <p className="text-white/50 text-[12px]">ทุกคนสามารถเข้าถึงเอกสารนี้ได้</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <ShieldCheck size={18} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">เอกสารส่วนตัว</p>
                          <p className="text-white/50 text-[12px]">เฉพาะผู้ที่ได้รับอนุญาตเท่านั้น</p>
                        </div>
                      </div>
                      {document.shared_users && document.shared_users.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-white/40 text-[12px] mb-3">แชร์ให้กับ ({document.shared_users.length} คน):</p>
                          <AvatarGroup>
                            {document.shared_users.map((u, i) => (
                              <Avatar key={i} className="ring-[#1d1d1f] border border-white/10" title={u.full_name || u.username}>
                                <AvatarImage src={u.profile_image ? `/api/uploads/profiles/${u.profile_image}` : ''} />
                                <AvatarFallback>{(u.full_name || u.username || '?').charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-white/50 text-sm">ไม่มีการแชร์ (เฉพาะคุณและผู้สร้าง)</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => onDownload(document.id, document.file_path)}
                  className="w-full bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-full py-3.5 px-6 font-medium text-[17px] transition-colors flex items-center justify-center gap-2 active:scale-95 duration-200"
                >
                  <Download size={20} />
                  ดาวน์โหลดเอกสาร
                </button>
                <button 
                  onClick={() => { onClose(); navigate(`/document/${document.id}`); }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full py-3.5 px-6 font-medium text-[17px] transition-colors flex items-center justify-center gap-2 active:scale-95 duration-200"
                >
                  ดูแบบเต็มจอ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
