import React, { useState, useEffect, useMemo, useRef } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import usePendingDeletes from '../hooks/usePendingDeletes';
import axiosClient from '../api/axiosClient';
import { FileText, Upload, Trash2, X, Share2, Users, Search, RefreshCw, ChevronRight, LayoutGrid, Grid3x3, List, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { toast } from 'sonner';
import DocumentPreview from '../components/DocumentPreview';
import ImageWithFallback from '../components/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '../components/ui/avatar';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function ManageDocuments() { 
  useDocumentTitle('จัดการเอกสาร');
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('ทั้งหมด');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('documentViewMode') || 'list';
  });

  useEffect(() => {
    localStorage.setItem('documentViewMode', viewMode);
  }, [viewMode]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageAccessModalOpen, setIsManageAccessModalOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  
  // Manage Access state
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSavingAccess, setIsSavingAccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category_id: '',
    is_public: 0,
    file: null
  });

  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/documents?mode=manage');
      setDocuments(res.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axiosClient.get('/users');
      setAllUsers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchAllUsers();
  }, [user]);

  // Click outside for search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tags = useMemo(() => {
    const uniqueTags = new Set(documents.map(doc => doc.category_name).filter(Boolean));
    return ['ทั้งหมด', 'สาธารณะ', 'ส่วนตัว', 'ที่แชร์กับฉัน', ...Array.from(uniqueTags)];
  }, [documents]);

  const fuse = useMemo(() => {
    return new Fuse(documents, {
      keys: ['title', 'description', 'category_name'],
      threshold: 0.3,
    });
  }, [documents]);

  const filteredDocs = useMemo(() => {
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
      const localFuse = new Fuse(result, { keys: ['title', 'description'], threshold: 0.4 });
      result = localFuse.search(searchTerm).map(r => r.item);
    }
    return result;
  }, [documents, activeTag, searchTerm]);

  const searchSuggestions = useMemo(() => {
    if (!fuse || searchTerm.trim() === '') return [];
    return fuse.search(searchTerm).slice(0, 5).map(r => r.item);
  }, [fuse, searchTerm]);

  const [selectedDocs, setSelectedDocs] = useState([]);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTag]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const isAllSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedDocs.includes(d.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDocs(selectedDocs.filter(id => !filteredDocs.find(d => d.id === id)));
    } else {
      const newSelected = new Set([...selectedDocs, ...filteredDocs.map(d => d.id)]);
      setSelectedDocs(Array.from(newSelected));
    }
  };

  const toggleSelectDoc = (id) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(selectedId => selectedId !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  const { registerDelete, unregisterDelete } = usePendingDeletes();

  const executeDelete = (idsToDelete, itemsToDelete) => {
    const count = idsToDelete.length;
    
    // Optimistic Update
    setDocuments(prev => prev.filter(doc => !idsToDelete.includes(doc.id)));
    setSelectedDocs(prev => prev.filter(id => !idsToDelete.includes(id)));

    let undone = false;
    let executed = false;
    const deleteId = Symbol('delete');

    const performDelete = async () => {
      if (undone || executed) return;
      executed = true;
      try {
        if (idsToDelete.length === 1) {
          await axiosClient.delete(`/documents/${idsToDelete[0]}`);
        } else {
          const res = await axiosClient.post('/documents/bulk-delete', { ids: idsToDelete });
          if (res.data.status !== 'success') {
             throw new Error('Failed to delete');
          }
        }
      } catch (error) {
        setDocuments(prev => {
          const newDocs = [...prev, ...itemsToDelete];
          return newDocs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        });
        setSelectedDocs(prev => [...prev, ...idsToDelete]);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    };

    registerDelete(deleteId, performDelete);

    const timeoutId = setTimeout(() => {
      if (!undone) {
        unregisterDelete(deleteId);
        performDelete();
      }
    }, 5000);

    toast.success(`ลบ ${count} รายการแล้ว`, {
      duration: 5000,
      action: {
        label: 'เลิกทำ (Undo)',
        onClick: () => {
          undone = true;
          clearTimeout(timeoutId);
          unregisterDelete(deleteId);
          setDocuments(prev => {
            const newDocs = [...prev, ...itemsToDelete];
            return newDocs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          });
          setSelectedDocs(prev => [...prev, ...idsToDelete]);
          toast.success('เลิกทำสำเร็จ');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedDocs.length === 0) return;
    
    const itemsToDelete = documents.filter(doc => selectedDocs.includes(doc.id));
    const idsToDelete = [...selectedDocs];
    
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล',
      message: 'คุณต้องการลบข้อมูลที่เลือกใช่หรือไม่? (การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที)',
      onConfirm: () => {
        executeDelete(idsToDelete, itemsToDelete);
      }
    });
  };

  const handleDelete = (id) => {
    const docToDelete = documents.find(d => d.id === id);
    if (!docToDelete) return;
    
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล',
      message: 'คุณต้องการลบข้อมูลที่เลือกใช่หรือไม่? (การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที)',
      onConfirm: () => {
        executeDelete([id], [docToDelete]);
      }
    });
  };

  const isUploadingRef = useRef(false);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingRef.current) return;
    
    if (!uploadData.file) {
      toast.warning('กรุณาเลือกไฟล์ที่จะอัปโหลด');
      return;
    }

    isUploadingRef.current = true;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('category_id', uploadData.category_id);
    formData.append('is_public', user?.role === 'admin' ? uploadData.is_public : 0);
    formData.append('file', uploadData.file);

    try {
      const res = await axiosClient.post('/documents', formData);
      if (res.data.status !== 'success') {
        throw new Error(res.data.message || 'Upload failed');
      }
      setIsUploadModalOpen(false);
      setUploadData({ title: '', description: '', category_id: '', is_public: 0, file: null });
      fetchData();
      toast.success('อัปโหลดเอกสารเรียบร้อยแล้ว');
    } catch (error) {
      toast.error('ไม่สามารถอัปโหลดเอกสารได้');
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
    }
  };

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
      .catch(() => {
        showAlert({ type: 'danger', title: 'ข้อผิดพลาด', message: 'ไม่สามารถดาวน์โหลดได้ หรือคุณไม่มีสิทธิ์เข้าถึงเอกสารนี้' });
      });
  };

  const openManageAccessModal = async (doc) => {
    setSelectedDocId(doc.id);
    setAssignedUserIds([]);
    setUserSearchTerm('');
    setIsManageAccessModalOpen(true);
    try {
      const res = await axiosClient.get(`/documents/${doc.id}/assigned-users`);
      if (res.data.status === 'success') {
        setAssignedUserIds(res.data.data.map(id => Number(id)));
      }
    } catch (error) {
      toast.error('ไม่สามารถดึงข้อมูลสิทธิ์การเข้าถึงได้');
    }
  };

  const toggleUserAccess = (userId) => {
    if (assignedUserIds.includes(userId)) {
      setAssignedUserIds(assignedUserIds.filter(id => id !== userId));
    } else {
      setAssignedUserIds([...assignedUserIds, userId]);
    }
  };

  const removeAssignedUser = (userId) => {
    setAssignedUserIds(assignedUserIds.filter(id => id !== userId));
  };

  const handleSaveAccess = async () => {
    if (!selectedDocId) return;
    setIsSavingAccess(true);
    try {
      const res = await axiosClient.post(`/documents/${selectedDocId}/sync-users`, {
        user_ids: assignedUserIds
      });
      if (res.data.status === 'success') {
        toast.success('บันทึกสิทธิ์การเข้าถึงเรียบร้อยแล้ว');
        setIsManageAccessModalOpen(false);
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกสิทธิ์');
    } finally {
      setIsSavingAccess(false);
    }
  };

  return (
    <div className="w-full bg-[#000000] min-h-screen pb-12 text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-[1440px] pt-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-[40px] font-semibold tracking-tight text-white">จัดการเอกสารของฉัน</h1>
            <p className="text-[#ffffff]/60 mt-2 text-[21px] font-light">อัปโหลด ลบ หรือแชร์เอกสารของคุณ</p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-full px-6 font-medium text-[17px] h-[44px] flex items-center transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            อัปโหลดเอกสารใหม่
          </button>
        </motion.div>

        {/* Search & Filter Section */}
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
                placeholder="ค้นหาในเอกสารที่ฉันจัดการ..." 
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
                  className="absolute top-full left-0 right-0 mt-2 bg-[#272729]/90 backdrop-blur-xl border border-[#333333] rounded-[18px] shadow-none overflow-hidden"
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
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center w-full max-w-3xl z-10 gap-4 mt-6 md:mt-0">
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

        {/* Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Bulk Actions */}
          <div className="flex items-center justify-end min-h-[44px]">
            <AnimatePresence>
              {selectedDocs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  className="flex items-center gap-3 bg-[#272729] border border-[#333333] px-4 py-2 rounded-xl shadow-none"
                >
                  <span className="text-sm font-medium text-white/80">เลือก {selectedDocs.length} รายการ</span>
                  <div className="w-[1px] h-4 bg-[#333333] mx-1"></div>
                  <Button 
                    variant="ghost"
                    onClick={() => setSelectedDocs([])}
                    className="h-8 px-3 text-xs md:text-sm rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    onClick={handleBulkDelete}
                    className="h-8 px-3 text-xs md:text-sm rounded-lg bg-white text-black hover:bg-white/90 font-medium"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    ลบ
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div 
                key="list-view"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="bg-[#272729] rounded-[18px] border border-[#333333] overflow-hidden shadow-none"
              >
                <Table>
              <TableHeader className="bg-black/20 border-b border-[#333333]">
                <TableRow className="hover:bg-transparent border-[#333333]">
                  <TableHead className="w-14 text-center text-white/50 font-medium py-5">
                    <input 
                      type="checkbox" 
                      className="rounded bg-black border-[#333333] accent-white cursor-pointer w-4 h-4" 
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-white/50 font-medium py-5 text-base md:text-lg">เอกสาร</TableHead>
                  <TableHead className="hidden md:table-cell text-white/50 font-medium py-5 text-base md:text-lg">สถานะ</TableHead>
                  <TableHead className="hidden md:table-cell text-white/50 font-medium py-5 text-base md:text-lg">วันที่อัปโหลด</TableHead>
                  <TableHead className="w-16 md:w-20 text-right text-white/50 font-medium py-5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="border-b border-white/5">
                        <TableCell className="py-5 text-center">
                          <Skeleton className="w-4 h-4 bg-white/5 mx-auto rounded" />
                        </TableCell>
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
                  </>
                ) : (
                  <>
                    {paginatedDocs.length > 0 ? (
                      paginatedDocs.map((doc) => {
                        const isImage = doc.file_path && /\.(jpeg|jpg|png|gif|webp)$/i.test(doc.file_path);
                        const token = localStorage.getItem('token') || '';
                        const previewUrl = `${axiosClient.defaults.baseURL}/documents/preview/${doc.id}?token=${token}`;
                        return (
                        <TableRow 
                          key={doc.id}
                          className={`border-b border-white/5 transition-colors group ${selectedDocs.includes(doc.id) ? 'bg-white/10 hover:bg-white/15' : 'hover:bg-white/5'}`}
                        >
                          <TableCell className="text-center py-4 md:py-5">
                            <input 
                              type="checkbox" 
                              className="rounded bg-black border-[#333333] accent-white cursor-pointer w-4 h-4" 
                              checked={selectedDocs.includes(doc.id)}
                              onChange={() => toggleSelectDoc(doc.id)}
                            />
                          </TableCell>
                          <TableCell className="py-4 md:py-5 cursor-pointer" onClick={() => setSelectedPreviewDoc(doc)}>
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white/5 flex items-center justify-center text-white/70 shrink-0 overflow-hidden border border-white/10">
                                {isImage ? (
                                  <ImageWithFallback src={previewUrl} alt={doc.title} className="object-cover" />
                                ) : (
                                  <FileText className="w-6 h-6 md:w-8 md:h-8" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-white/90 text-base md:text-lg truncate hover:text-[#2997ff] transition-colors">{doc.title}</span>
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
                          <TableCell className="text-right py-4 md:py-5 pr-4 md:pr-6">
                            <div className="flex items-center justify-end gap-2">
                              {doc.shared_users && doc.shared_users.length > 0 && (
                                <AvatarGroup>
                                  {doc.shared_users.slice(0, 3).map((u) => (
                                    <Avatar key={u.id} title={u.full_name}>
                                      <AvatarImage src={u.profile_image ? `/api/uploads/profiles/${u.profile_image}` : undefined} />
                                      <AvatarFallback>{u.full_name?.charAt(0) || u.username?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {doc.shared_users.length > 3 && (
                                    <AvatarGroupCount>+{doc.shared_users.length - 3}</AvatarGroupCount>
                                  )}
                                </AvatarGroup>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-[#272729] border-[#333333] text-white rounded-xl shadow-none p-1.5">
                                  {doc.is_public == 0 && (user?.role === 'admin' || doc.created_by === user?.id) && (
                                    <DropdownMenuItem 
                                      onClick={(e) => { e.stopPropagation(); openManageAccessModal(doc); }}
                                      className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                                    >
                                      <Users className="w-4 h-4 mr-2.5 text-white/60" /> จัดการสิทธิ์
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(doc.id, doc.file_path); }}
                                    className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4 mr-2.5 text-white/60" /> ดาวน์โหลด
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10 my-1.5" />
                                  <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                    className="text-sm py-2.5 px-3 rounded-lg text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2.5" /> ลบเอกสาร
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-40 text-center text-white/50 text-base">
                          ไม่พบเอกสารในระบบ
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <motion.div 
            key={`grid-view-${viewMode}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className={viewMode === 'large' ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}
          >
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`bg-[#272729] rounded-[18px] border border-[#333333] shadow-none p-4 flex flex-col gap-4 ${viewMode === 'large' ? 'min-h-[200px]' : 'min-h-[140px]'}`}>
                      <Skeleton className={`w-full ${viewMode === 'large' ? 'h-64 md:h-72' : 'h-40'} bg-white/5 rounded-xl`} />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4 bg-white/10" />
                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                      </div>
                    </div>
                  ))}
                </>
              ) : paginatedDocs.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {paginatedDocs.map((doc) => {
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
                        className={`group relative bg-[#272729] rounded-[18px] border border-[#333333] shadow-none overflow-hidden transition-all hover:border-[#ffffff]/20 flex flex-col ${selectedDocs.includes(doc.id) ? 'ring-2 ring-[#0066cc] border-[#0066cc]' : ''}`}
                      >
                        <div className="absolute top-3 left-3 z-10">
                          <input 
                            type="checkbox" 
                            className="rounded bg-black border-[#333333] accent-white cursor-pointer w-5 h-5"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectDoc(doc.id);
                            }}
                          />
                        </div>
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/40 text-white/70 hover:text-white hover:bg-black/60 rounded-full backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#272729] border-[#333333] text-white rounded-xl shadow-none p-1.5">
                              {doc.is_public == 0 && (user?.role === 'admin' || doc.created_by === user?.id) && (
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); openManageAccessModal(doc); }}
                                  className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                                >
                                  <Users className="w-4 h-4 mr-2.5 text-white/60" /> จัดการสิทธิ์
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc.id, doc.file_path); }}
                                className="text-sm py-2.5 px-3 rounded-lg hover:bg-white/10 cursor-pointer"
                              >
                                <FileText className="w-4 h-4 mr-2.5 text-white/60" /> ดาวน์โหลด
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10 my-1.5" />
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                className="text-sm py-2.5 px-3 rounded-lg text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2.5" /> ลบเอกสาร
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div 
                          className={`w-full bg-black/20 flex items-center justify-center shrink-0 cursor-pointer border-b border-[#333333] ${viewMode === 'large' ? 'h-64 md:h-72' : 'h-40'}`}
                          onClick={() => setSelectedPreviewDoc(doc)}
                        >
                          {isImage ? (
                            <ImageWithFallback src={previewUrl} alt={doc.title} className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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
                          </div>
                          
                          <h4 
                            className={`font-medium text-white/90 hover:text-[#2997ff] transition-colors cursor-pointer truncate ${viewMode === 'large' ? 'text-xl md:text-2xl' : 'text-lg'}`}
                            onClick={() => setSelectedPreviewDoc(doc)}
                          >
                            {doc.title}
                          </h4>
                          
                          <p className={`text-white/50 truncate font-light mt-1 flex-1 ${viewMode === 'large' ? 'text-base' : 'text-sm'}`}>
                            {doc.description || 'ไม่มีคำอธิบาย'}
                          </p>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#333333]">
                            <span className="text-[11px] text-white/40">
                              {new Date(doc.created_at).toLocaleDateString('th-TH')}
                            </span>
                            
                            {doc.shared_users && doc.shared_users.length > 0 && (
                              <AvatarGroup>
                                {doc.shared_users.slice(0, 3).map((u) => (
                                  <Avatar key={u.id} title={u.full_name} className="w-5 h-5 border border-[#272729]">
                                    <AvatarImage src={u.profile_image ? `/api/uploads/profiles/${u.profile_image}` : undefined} />
                                    <AvatarFallback className="text-[8px]">{u.full_name?.charAt(0) || u.username?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {doc.shared_users.length > 3 && (
                                  <AvatarGroupCount className="w-5 h-5 text-[8px] border border-[#272729] bg-white/10 text-white">+{doc.shared_users.length - 3}</AvatarGroupCount>
                                )}
                              </AvatarGroup>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <div className="col-span-full h-40 flex items-center justify-center text-white/50 text-base border border-dashed border-[#333333] rounded-[18px]">
                  ไม่พบเอกสารในระบบ
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

        {/* Pagination Footer */}
        {!loading && filteredDocs.length > 0 && (
          <div className="flex items-center justify-between mt-8 p-5 rounded-[18px] border border-[#333333] bg-[#272729] text-sm md:text-base text-white/50">
            <div>แสดง {paginatedDocs.length} จาก {filteredDocs.length} รายการ</div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base rounded-lg border-[#333333] bg-transparent text-white/70 hover:bg-white/10 hover:text-white" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ก่อนหน้า
              </Button>
              <span className="text-white">หน้า {currentPage} จาก {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base rounded-lg border-[#333333] bg-transparent text-white/70 hover:bg-white/10 hover:text-white" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="bg-[#272729] rounded-[18px] border border-[#333333] p-8 w-full max-w-lg relative z-10 shadow-none"
              >
                <button 
                  onClick={() => setIsUploadModalOpen(false)} 
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#ffffff]/10 flex items-center justify-center hover:bg-[#ffffff]/20 text-white transition-colors"
                >
                  <X size={16} />
                </button>
                
                <h3 className="font-semibold text-[28px] mb-8 tracking-tight text-white">อัปโหลดเอกสารใหม่</h3>
                
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">ชื่อเอกสาร</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 bg-[#000000] border border-[#ffffff]/10 focus:border-[#2997ff] text-[17px] text-white rounded-[11px] h-[44px] outline-none transition-colors" 
                      value={uploadData.title}
                      onChange={e => setUploadData({...uploadData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">รายละเอียด</label>
                    <textarea 
                      className="w-full p-4 bg-[#000000] border border-[#ffffff]/10 focus:border-[#2997ff] text-[17px] text-white rounded-[11px] h-24 outline-none transition-colors" 
                      value={uploadData.description}
                      onChange={e => setUploadData({...uploadData, description: e.target.value})}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">หมวดหมู่ (Tag)</label>
                    <select 
                      className="w-full px-4 bg-[#000000] border border-[#ffffff]/10 focus:border-[#2997ff] text-[17px] text-white rounded-[11px] h-[44px] outline-none transition-colors appearance-none"
                      value={uploadData.category_id}
                      onChange={e => setUploadData({...uploadData, category_id: e.target.value})}
                      required
                    >
                      <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {user?.role === 'admin' ? (
                    <div>
                      <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">สิทธิ์การเข้าถึง</label>
                      <select 
                        className="w-full px-4 bg-[#000000] border border-[#ffffff]/10 focus:border-[#2997ff] text-[17px] text-white rounded-[11px] h-[44px] outline-none transition-colors appearance-none"
                        value={uploadData.is_public}
                        onChange={e => setUploadData({...uploadData, is_public: parseInt(e.target.value)})}
                      >
                        <option value={0}>ส่วนตัว (Private)</option>
                        <option value={1}>สาธารณะ (Public)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="bg-[#ffffff]/5 p-4 rounded-[11px] border border-[#ffffff]/10 flex gap-3">
                      <div className="text-[#ffffff]/60 mt-0.5"><FileText size={20} /></div>
                      <div>
                        <p className="text-[14px] font-semibold text-white">อัปโหลดเป็นส่วนตัว (Private)</p>
                        <p className="text-[12px] text-[#ffffff]/50 mt-1">เอกสารนี้จะเป็นความลับ และคุณสามารถเลือกแชร์ให้บุคคลอื่นได้ภายหลัง</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">ไฟล์เอกสาร / รูปภาพ</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        required
                        className="block w-full text-[14px] text-[#ffffff]/70
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-[14px] file:font-semibold
                          file:bg-[#ffffff]/10 file:text-white
                          hover:file:bg-[#ffffff]/20 transition-colors"
                        onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                      />
                      <p className="text-[12px] text-white/50 mt-2">อัปโหลดได้สูงสุด 10MB</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={isUploading} className="w-full bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-full text-[17px] font-medium h-[44px] mt-8 flex items-center justify-center transition-colors">
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                    {isUploading ? 'กำลังอัปโหลด...' : 'ยืนยันการอัปโหลด'}
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Manage Access Modal */}
        <AnimatePresence>
          {isManageAccessModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsManageAccessModalOpen(false)}
                className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="bg-[#272729] rounded-[18px] border border-[#333333] p-6 md:p-8 w-full max-w-lg relative z-10 shadow-none flex flex-col max-h-[90vh]"
              >
                <button 
                  onClick={() => setIsManageAccessModalOpen(false)} 
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#ffffff]/10 flex items-center justify-center hover:bg-[#ffffff]/20 text-white transition-colors"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#2997ff]/20 rounded-full flex items-center justify-center text-[#2997ff] shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[24px] tracking-tight text-white">จัดการสิทธิ์การเข้าถึง</h3>
                    <p className="text-[14px] text-[#ffffff]/60">เลือกผู้ใช้งานที่คุณต้องการให้สิทธิ์</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 overflow-hidden flex-1">
                  {/* Selected Users Tags */}
                  {assignedUserIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                      {assignedUserIds.map(id => {
                        const u = allUsers.find(user => user.id === id);
                        if (!u) return null;
                        return (
                          <div key={id} className="flex items-center gap-2 bg-[#2997ff]/20 text-[#2997ff] px-3 py-1.5 rounded-full text-sm font-medium border border-[#2997ff]/30">
                            <span className="truncate max-w-[120px]">{u.full_name || u.username}</span>
                            <button onClick={() => removeAssignedUser(id)} className="hover:bg-[#2997ff]/30 rounded-full p-0.5 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-[#ffffff]/40" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="ค้นหาชื่อ, อีเมล หรือชื่อผู้ใช้..." 
                      className="w-full pl-11 pr-4 bg-[#000000] border border-[#ffffff]/10 focus:border-[#2997ff] text-[15px] text-white rounded-[11px] h-[44px] outline-none transition-colors"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* User List */}
                  <div className="space-y-2 overflow-y-auto flex-1 pr-2 min-h-[200px]">
                    {allUsers
                      .filter(u => u.id !== user?.id)
                      .filter(u => {
                        if (!userSearchTerm) return true;
                        const term = userSearchTerm.toLowerCase();
                        return (
                          (u.username && u.username.toLowerCase().includes(term)) ||
                          (u.full_name && u.full_name.toLowerCase().includes(term)) ||
                          (u.email && u.email.toLowerCase().includes(term))
                        );
                      })
                      .map(u => (
                      <label key={u.id} className="flex items-center justify-between p-3 bg-[#000000]/50 border border-[#ffffff]/10 rounded-[11px] cursor-pointer hover:bg-[#ffffff]/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <Users size={18} className="text-[#ffffff]/50" />
                          <div>
                            <p className="font-medium text-[15px] text-white">{u.full_name || u.username}</p>
                            <p className="text-[12px] text-[#ffffff]/50">{u.email ? u.email : `@${u.username}`}</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox"
                          className="rounded bg-black border-[#333333] accent-white cursor-pointer w-5 h-5"
                          checked={assignedUserIds.includes(u.id)}
                          onChange={() => toggleUserAccess(u.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    onClick={() => setIsManageAccessModalOpen(false)}
                    className="px-5 py-2.5 rounded-[11px] text-[15px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveAccess}
                    disabled={isSavingAccess}
                    className="px-6 py-2.5 rounded-[11px] text-[15px] font-medium text-white bg-[#0066cc] hover:bg-[#0071e3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSavingAccess && <RefreshCw size={16} className="animate-spin" />}
                    บันทึก
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
