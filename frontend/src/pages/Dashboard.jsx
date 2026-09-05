import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Download, FileText, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentPreview from '../components/DocumentPreview';

export default function Dashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const searchContainerRef = useRef(null);

  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await axiosClient.get('/documents');
      const allDocs = res.data.data;
      if (user?.role === 'admin') {
        return allDocs;
      } else {
        return allDocs.filter(doc => doc.is_public === 1 || doc.id % 2 === 0);
      }
    }
  });

  const tags = useMemo(() => {
    if (!documents) return [];
    const uniqueTags = new Set(documents.map(doc => doc.category_name).filter(Boolean));
    return ['all', ...Array.from(uniqueTags)];
  }, [documents]);

  const fuse = useMemo(() => {
    if (!documents) return null;
    return new Fuse(documents, {
      keys: ['title', 'description', 'category_name'],
      threshold: 0.3,
    });
  }, [documents]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (id, filename) => {
    axiosClient.get(`/documents/download/${id}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `document_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSelectedPreviewDoc(null);
      })
      .catch((error) => {
        alert("ไม่สามารถดาวน์โหลดได้ หรือคุณไม่มีสิทธิ์เข้าถึงเอกสารนี้");
      });
  };

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    let result = documents;
    if (activeTag !== 'all') {
      result = result.filter(doc => doc.category_name === activeTag);
    }
    if (searchTerm.trim() !== '') {
      if (fuse) {
        const localFuse = new Fuse(result, { keys: ['title', 'description'], threshold: 0.4 });
        result = localFuse.search(searchTerm).map(r => r.item);
      }
    }
    return result;
  }, [documents, activeTag, searchTerm, fuse]);

  const searchSuggestions = useMemo(() => {
    if (!fuse || searchTerm.trim() === '') return [];
    return fuse.search(searchTerm).slice(0, 5).map(r => r.item);
  }, [fuse, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.2, duration: 0.6 } }
  };

  return (
    <div className="w-full bg-[#000000] min-h-screen text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-[1440px] pt-12 md:pt-20 pb-20">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-12"
        >
          <h1 className="text-[40px] font-semibold tracking-tight text-white">คลังเอกสาร</h1>
          <p className="text-[#ffffff]/60 mt-2 text-[21px] font-light">ค้นหาและดาวน์โหลดเอกสารที่คุณต้องการ</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center mb-12 space-y-6"
        >
          {/* Fuzzy Search */}
          <div className="relative w-full max-w-2xl z-20" ref={searchContainerRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={20} className="text-[#ffffff]/40" />
              </div>
              <input 
                type="text" 
                placeholder="ค้นหาด้วยชื่อเอกสาร หรือรายละเอียด..." 
                className="w-full pl-12 pr-4 bg-[#272729] rounded-[9999px] border border-[#e0e0e0]/20 focus:border-[#2997ff] text-[17px] text-white h-[44px] outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>
            
            {/* Suggestions */}
            <AnimatePresence>
              {isDropdownOpen && searchSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#2a2a2c]/90 backdrop-blur-xl border border-[#ffffff]/10 rounded-[18px] shadow-2xl overflow-hidden"
                >
                  <ul className="py-2">
                    {searchSuggestions.map(doc => (
                      <li key={doc.id}>
                        <button 
                          className="w-full text-left px-5 py-3 hover:bg-[#0066cc] text-white transition-colors flex items-center gap-3"
                          onClick={() => {
                            setSearchTerm(doc.title);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <FileText size={16} className="opacity-60" />
                          <div>
                            <p className="text-[17px] leading-tight font-medium">{doc.title}</p>
                            {doc.category_name && <p className="text-[12px] opacity-60 mt-0.5">{doc.category_name}</p>}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl z-10">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-[14px] transition-colors border ${
                  activeTag === tag 
                    ? 'bg-transparent border-[#2997ff] text-[#2997ff]' 
                    : 'bg-transparent border-[#ffffff]/20 text-[#ffffff]/70 hover:border-[#ffffff]/40'
                }`}
              >
                {tag === 'all' ? 'ทั้งหมด' : tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Document Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-[#ffffff]/50">
            <RefreshCw className="animate-spin mr-2" size={24} /> กำลังโหลดข้อมูล...
          </div>
        ) : isError ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4 border border-[#ff3b30]/30 text-[#ff3b30] rounded-[18px] bg-[#ff3b30]/10"
          >
            เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง
          </motion.div>
        ) : filteredDocs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#272729] rounded-[18px] p-20 text-center"
          >
            <FileText size={48} className="text-[#ffffff]/20 mb-4 mx-auto" />
            <h3 className="text-[21px] font-semibold text-[#ffffff]/70">ไม่พบเอกสาร</h3>
            <p className="text-[17px] text-[#ffffff]/50 mt-2 font-light">ไม่มีเอกสารในหมวดหมู่นี้ หรือคำค้นหาไม่ตรงกัน</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredDocs.map((doc) => (
                <motion.div 
                  key={doc.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedPreviewDoc(doc)}
                  className="bg-[#272729] rounded-[18px] border border-[#ffffff]/5 hover:border-[#ffffff]/15 transition-all cursor-pointer flex flex-col group overflow-hidden"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[12px] text-[#ffffff]/50 font-medium tracking-wide uppercase">
                        {doc.category_name || 'ทั่วไป'}
                      </span>
                    </div>
                    
                    <h2 className="text-[17px] font-semibold leading-tight text-white mb-2">{doc.title}</h2>
                    <p className="text-[14px] text-[#ffffff]/50 line-clamp-2 leading-relaxed flex-1 font-light">
                      {doc.description || 'ไม่มีคำอธิบาย'}
                    </p>
                    
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-[12px] text-[#ffffff]/40 font-light">{doc.file_size}</span>
                      <span className="text-[#2997ff] text-[14px] font-normal group-hover:underline flex items-center gap-1">
                        ดาวน์โหลด <ChevronRight size={14} className="mt-0.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <DocumentPreview 
        isOpen={!!selectedPreviewDoc} 
        document={selectedPreviewDoc} 
        onClose={() => setSelectedPreviewDoc(null)} 
        onDownload={handleDownload}
      />
    </div>
  );
}
