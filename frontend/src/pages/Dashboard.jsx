import React, { useState, useMemo, useEffect, useRef } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Download, FileText, Search, RefreshCw, ChevronRight, LayoutGrid, Grid3x3, List, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentPreview from '../components/DocumentPreview';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export default function Dashboard() { 
  useDocumentTitle('Dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('ทั้งหมด');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const searchContainerRef = useRef(null);

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('documentViewMode') || 'list';
  });

  useEffect(() => {
    localStorage.setItem('documentViewMode', viewMode);
  }, [viewMode]);

  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await axiosClient.get('/documents');
      return res.data.data;
    }
  });

  const tags = useMemo(() => {
    if (!documents) return [];
    const uniqueTags = new Set(documents.map(doc => doc.category_name).filter(Boolean));
    return ['ทั้งหมด', 'สาธารณะ', 'ส่วนตัว', 'ที่แชร์กับฉัน', ...Array.from(uniqueTags)];
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
    if (activeTag === 'สาธารณะ') {
      result = result.filter(doc => doc.is_public == 1);
    } else if (activeTag === 'ส่วนตัว') {
      result = result.filter(doc => doc.created_by == user?.id);
    } else if (activeTag === 'ที่แชร์กับฉัน') {
      result = result.filter(doc => doc.is_public == 0 && doc.created_by != user?.id);
    } else if (activeTag !== 'ทั้งหมด' && activeTag !== 'all') {
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
            <AnimatePresence mode="wait">
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

          {/* Tags and View Mode Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center w-full max-w-4xl z-10 gap-4">
            <div className="flex flex-wrap justify-start gap-2 w-full md:w-auto flex-1">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-2 rounded-full text-[14px] transition-colors border ${
                    activeTag === tag || (activeTag === 'all' && tag === 'ทั้งหมด')
                      ? 'bg-transparent border-[#2997ff] text-[#2997ff]' 
                      : 'bg-transparent border-[#ffffff]/20 text-[#ffffff]/70 hover:border-[#ffffff]/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="flex bg-transparent border border-white/10 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('large')}
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'large' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                title="Large Cards"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'compact' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                title="Compact Cards"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Document Views */}
        {isLoading ? (
          viewMode === 'list' ? (
            <div className="bg-[#272729] rounded-[18px] border border-[#333333] overflow-hidden shadow-none max-w-4xl mx-auto w-full">
              <Table>
                <TableHeader className="bg-black/20 border-b border-[#333333]">
                  <TableRow className="hover:bg-transparent border-[#333333]">
                    <TableHead className="text-white/50 font-medium py-5 text-base md:text-lg">เอกสาร</TableHead>
                    <TableHead className="hidden md:table-cell text-white/50 font-medium py-5 text-base md:text-lg">สถานะ</TableHead>
                    <TableHead className="hidden md:table-cell text-white/50 font-medium py-5 text-base md:text-lg">วันที่อัปโหลด</TableHead>
                    <TableHead className="w-16 md:w-20 text-right text-white/50 font-medium py-5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="border-b border-white/5">
                      <TableCell className="py-5">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-lg shrink-0" />
                          <div className="flex flex-col gap-2 w-full">
                            <Skeleton className="h-4 w-3/4 bg-white/10" />
                            <Skeleton className="h-3 w-1/2 bg-white/5" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-5">
                        <Skeleton className="h-6 w-20 bg-white/5 rounded-md" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-5">
                        <Skeleton className="h-4 w-24 bg-white/5" />
                      </TableCell>
                      <TableCell className="py-5 text-right">
                        <Skeleton className="h-8 w-8 bg-white/5 rounded-md ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className={viewMode === 'large' ? "grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full"}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`bg-[#272729] rounded-[18px] border border-[#333333] shadow-none p-4 flex flex-col gap-4 ${viewMode === 'large' ? 'min-h-[200px]' : 'min-h-[140px]'}`}>
                  <Skeleton className={`w-full ${viewMode === 'large' ? 'h-64 md:h-72' : 'h-40'} bg-white/5 rounded-xl`} />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : isError ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4 border border-[#ff3b30]/30 text-[#ff3b30] rounded-[18px] bg-[#ff3b30]/10 max-w-4xl mx-auto"
          >
            เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง
          </motion.div>
        ) : filteredDocs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#272729] rounded-[18px] p-20 text-center max-w-4xl mx-auto"
          >
            <FileText size={48} className="text-[#ffffff]/20 mb-4 mx-auto" />
            <h3 className="text-[21px] font-semibold text-[#ffffff]/70">ไม่พบเอกสาร</h3>
            <p className="text-[17px] text-[#ffffff]/50 mt-2 font-light">ไม่มีเอกสารในหมวดหมู่นี้ หรือคำค้นหาไม่ตรงกัน</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div 
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto w-full"
              >
                <div className="bg-[#272729] rounded-[18px] border border-[#333333] overflow-hidden shadow-none w-full">
                  <Table>
                    <TableHeader className="bg-black/20 border-b border-[#333333]">
                      <TableRow className="hover:bg-transparent border-[#333333]">
                        <TableHead className="text-white/50 font-medium py-5 text-base md:text-lg">เอกสาร</TableHead>
                        <TableHead className="hidden md:table-cell text-white/50 font-medium py-5 text-base md:text-lg">สถานะ</TableHead>
                        <TableHead className="hidden md:table-cell text-white/50 font-medium py-5 text-base md:text-lg">วันที่อัปโหลด</TableHead>
                        <TableHead className="w-16 md:w-20 text-right text-white/50 font-medium py-5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocs.map((doc) => {
                        const isImage = doc.file_path && /\.(jpeg|jpg|png|gif|webp)$/i.test(doc.file_path);
                        const token = localStorage.getItem('token') || '';
                        const previewUrl = `${axiosClient.defaults.baseURL}/documents/preview/${doc.id}?token=${token}`;
                        return (
                          <TableRow 
                            key={doc.id}
                            className="border-b border-white/5 transition-colors group hover:bg-white/5 cursor-pointer"
                            onClick={() => navigate(`/document/${doc.id}`)}
                          >
                            <TableCell className="py-4 md:py-5">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white/5 flex items-center justify-center text-white/70 shrink-0 overflow-hidden border border-white/10">
                                  {isImage ? (
                                    <img src={previewUrl} alt={doc.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <FileText className="w-6 h-6 md:w-8 md:h-8" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-white/90 text-base md:text-lg truncate group-hover:text-[#2997ff] transition-colors">{doc.title}</span>
                                    {doc.is_public == 1 ? (
                                      <span className="md:hidden px-2 py-0.5 bg-white/10 text-white rounded text-[10px] font-medium uppercase">สาธารณะ</span>
                                    ) : (doc.is_public == 0 && doc.created_by !== user?.id) ? (
                                      <span className="md:hidden px-2 py-0.5 bg-[#0066cc]/20 text-[#2997ff] rounded text-[10px] font-medium uppercase">แชร์กับคุณ</span>
                                    ) : (
                                      <span className="md:hidden px-2 py-0.5 bg-black border border-white/10 text-white/70 rounded text-[10px] font-medium uppercase">ส่วนตัว</span>
                                    )}
                                  </div>
                                  <span className="text-xs md:text-sm text-white/50 truncate font-light mt-0.5">{doc.description || 'ไม่มีคำอธิบาย'}</span>
                                  <span className="text-[10px] md:text-xs text-white/40 md:hidden mt-0.5">{new Date(doc.created_at).toLocaleDateString('th-TH')}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-5 text-white/70 text-base md:text-lg">
                              {doc.is_public == 1 ? (
                                <span className="px-3 py-1 bg-white/10 text-white rounded-md text-[12px] font-medium uppercase tracking-wider">
                                  สาธารณะ
                                </span>
                              ) : (doc.is_public == 0 && doc.created_by !== user?.id) ? (
                                <span className="px-3 py-1 bg-[#0066cc]/20 text-[#2997ff] rounded-md text-[12px] font-medium uppercase tracking-wider">
                                  แชร์กับคุณ
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-black border border-white/10 text-white/70 rounded-md text-[12px] font-medium uppercase tracking-wider">
                                  ส่วนตัว
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-5 text-white/70 text-base md:text-lg font-light">
                              {new Date(doc.created_at).toLocaleDateString('th-TH')}
                            </TableCell>
                            <TableCell className="text-right py-4 md:py-5 pr-4 md:pr-6" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-[#272729] border-[#333333] text-white rounded-xl shadow-none p-1.5">
                                  <DropdownMenuItem 
                                    onClick={() => setSelectedPreviewDoc(doc)}
                                    className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                                  >
                                    <Search className="w-4 h-4 mr-2.5 text-white/60" /> ดูตัวอย่าง
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDownload(doc.id, doc.file_path)}
                                    className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                                  >
                                    <Download className="w-4 h-4 mr-2.5 text-white/60" /> ดาวน์โหลด
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={`grid-view-${viewMode}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className={viewMode === 'large' ? "grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full"}
              >
                {filteredDocs.map((doc) => {
                  const isImage = doc.file_path && /\.(jpeg|jpg|png|gif|webp)$/i.test(doc.file_path);
                  const token = localStorage.getItem('token') || '';
                  const previewUrl = `${axiosClient.defaults.baseURL}/documents/preview/${doc.id}?token=${token}`;
                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="group relative bg-[#272729] rounded-[18px] border border-[#333333] shadow-none overflow-hidden transition-all hover:border-[#ffffff]/20 flex flex-col cursor-pointer"
                    >
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/40 text-white/70 hover:text-white hover:bg-black/60 rounded-full backdrop-blur-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#272729] border-[#333333] text-white rounded-xl shadow-none p-1.5">
                            <DropdownMenuItem 
                              onClick={() => setSelectedPreviewDoc(doc)}
                              className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                            >
                              <Search className="w-4 h-4 mr-2.5 text-white/60" /> ดูตัวอย่าง
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDownload(doc.id, doc.file_path)}
                              className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                            >
                              <Download className="w-4 h-4 mr-2.5 text-white/60" /> ดาวน์โหลด
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div 
                        className={`w-full bg-black/20 flex items-center justify-center shrink-0 border-b border-[#333333] ${viewMode === 'large' ? 'h-64 md:h-72' : 'h-40'}`}
                      >
                        {isImage ? (
                          <img src={previewUrl} alt={doc.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <FileText className="w-12 h-12 text-white/20" />
                        )}
                      </div>
                      
                      <div className={`flex flex-col flex-1 ${viewMode === 'large' ? 'p-6 md:p-8' : 'p-5'}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {doc.is_public == 1 ? (
                            <span className="px-2 py-0.5 bg-white/10 text-white rounded text-[10px] font-medium uppercase">สาธารณะ</span>
                          ) : (doc.is_public == 0 && doc.created_by !== user?.id) ? (
                            <span className="px-2 py-0.5 bg-[#0066cc]/20 text-[#2997ff] rounded text-[10px] font-medium uppercase">แชร์กับคุณ</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-black border border-white/10 text-white/70 rounded text-[10px] font-medium uppercase">ส่วนตัว</span>
                          )}
                          <span className="px-2 py-0.5 bg-white/10 text-white rounded text-[10px] font-medium uppercase">{doc.category_name || 'ทั่วไป'}</span>
                        </div>
                        
                        <h4 className={`font-medium text-white/90 group-hover:text-[#2997ff] transition-colors truncate ${viewMode === 'large' ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                          {doc.title}
                        </h4>
                        
                        <p className={`text-white/50 truncate font-light mt-1 flex-1 ${viewMode === 'large' ? 'text-base' : 'text-sm'}`}>
                          {doc.description || 'ไม่มีคำอธิบาย'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#333333]">
                          <span className="text-[11px] text-white/40">
                            {new Date(doc.created_at).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              )}
            </AnimatePresence>
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
