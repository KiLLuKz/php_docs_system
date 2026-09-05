import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Calendar, HardDrive, ShieldCheck } from 'lucide-react';

export default function DocumentPreview({ document, isOpen, onClose, onDownload }) {
  if (!document) return null;

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
            <div className="w-full md:w-[45%] bg-[#000000] border-r border-hairline/30 flex items-center justify-center p-12 shrink-0">
              <div className="flex flex-col items-center opacity-60">
                <FileText size={80} className="mb-4 text-[#2997ff]" />
                <p className="text-[14px] uppercase tracking-wider text-center">PDF Document Preview</p>
              </div>
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
                <div className="flex items-center gap-3 col-span-2">
                  <div className="w-10 h-10 rounded-full bg-[#d2d2d7]/5 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[#ffffff]/50" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#ffffff]/40">สิทธิ์การเข้าถึง</p>
                    <p className="text-[14px] font-medium text-[#ffffff]/80">
                      {document.is_public ? 'เอกสารสาธารณะ' : 'เอกสารส่วนตัว'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => onDownload(document.id, document.file_path)}
                className="w-full bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-full py-3.5 px-6 font-medium text-[17px] transition-colors flex items-center justify-center gap-2 mt-auto active:scale-95 duration-200"
              >
                <Download size={20} />
                ดาวน์โหลดเอกสาร
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
