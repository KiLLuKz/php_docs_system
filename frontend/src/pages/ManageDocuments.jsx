import React, { useState, useEffect, useMemo, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { FileText, Upload, Trash2, X, Share2, Users, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import DocumentPreview from '../components/DocumentPreview';

export default function ManageDocuments() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    is_public: 0,
    file: null
  });

  const dummyUsers = [
    { id: 1, username: 'admin', full_name: 'System Administrator' },
    { id: 2, username: 'user1', full_name: 'John Doe' },
    { id: 3, username: 'jane_smith', full_name: 'Jane Smith' },
  ];

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/documents');
      if (user?.role === 'admin') {
        setDocuments(res.data.data);
      } else {
        setDocuments(res.data.data.filter((_, idx) => idx % 2 === 0)); 
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    return ['all', ...Array.from(uniqueTags)];
  }, [documents]);

  const fuse = useMemo(() => {
    return new Fuse(documents, {
      keys: ['title', 'description', 'category_name'],
      threshold: 0.3,
    });
  }, [documents]);

  const filteredDocs = useMemo(() => {
    let result = documents;
    if (activeTag !== 'all') {
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

  const handleDelete = (id) => {
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบเอกสาร',
      message: 'คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้? ข้อมูลจะไม่สามารถกู้คืนได้',
      onConfirm: async () => {
        try {
          await axiosClient.delete(`/documents/${id}`);
          setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
          showAlert({ type: 'danger', title: 'ผิดพลาด', message: 'ไม่สามารถลบเอกสารได้' });
        }
      }
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      showAlert({ type: 'warning', title: 'แจ้งเตือน', message: 'กรุณาเลือกไฟล์ที่จะอัปโหลด' });
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('is_public', user?.role === 'admin' ? uploadData.is_public : 0);
    formData.append('file', uploadData.file);

    try {
      await axiosClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploadModalOpen(false);
      setUploadData({ title: '', description: '', is_public: 0, file: null });
      fetchData();
      showAlert({ type: 'info', title: 'สำเร็จ', message: 'อัปโหลดเอกสารเรียบร้อยแล้ว' });
    } catch (error) {
      showAlert({ type: 'danger', title: 'ผิดพลาด', message: 'ไม่สามารถอัปโหลดเอกสารได้' });
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

  const openShareModal = (docId) => {
    setSelectedDocId(docId);
    setIsShareModalOpen(true);
  };

  const handleShare = (userId) => {
    setIsShareModalOpen(false);
    showAlert({ type: 'info', title: 'สำเร็จ', message: 'ส่งสิทธิ์การเข้าถึงเอกสารให้ผู้ใช้งานเรียบร้อยแล้ว' });
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

        {/* Table View */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#272729] rounded-[18px] border border-[#ffffff]/10 overflow-hidden shadow-2xl"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20 text-[#ffffff]/50">
              <RefreshCw className="animate-spin mr-2" size={24} /> กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-[#000000]/40 text-[14px] text-[#ffffff]/70 border-b border-[#ffffff]/10">
                  <tr>
                    <th className="font-semibold tracking-wide py-5">ชื่อเอกสาร</th>
                    <th className="font-semibold tracking-wide py-5">สถานะ</th>
                    <th className="font-semibold tracking-wide py-5">วันที่อัปโหลด</th>
                    <th className="text-right font-semibold tracking-wide py-5 pr-8">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredDocs.map((doc) => (
                      <motion.tr 
                        key={doc.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="hover:bg-[#ffffff]/5 transition-colors border-b border-[#ffffff]/5"
                      >
                        <td className="py-5 cursor-pointer" onClick={() => setSelectedPreviewDoc(doc)}>
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#ffffff]/5 rounded-xl text-[#ffffff]/60 flex-shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-medium text-[17px] text-white hover:text-[#2997ff] transition-colors">{doc.title}</div>
                              <div className="text-[14px] text-[#ffffff]/50 max-w-sm truncate font-light">{doc.description || 'ไม่มีคำอธิบาย'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {doc.is_public ? (
                            <span className="px-3 py-1 bg-[#ffffff]/10 text-white rounded-md text-[12px] font-medium uppercase tracking-wider">
                              สาธารณะ
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[#000000] border border-[#ffffff]/10 text-[#ffffff]/70 rounded-md text-[12px] font-medium uppercase tracking-wider">
                              ส่วนตัว
                            </span>
                          )}
                        </td>
                        <td className="text-[#ffffff]/70 text-[14px] font-light">
                          {new Date(doc.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="text-right space-x-2 whitespace-nowrap pr-8">
                          {!doc.is_public && (
                            <button 
                              onClick={() => openShareModal(doc.id)}
                              className="w-8 h-8 rounded-full hover:bg-[#2997ff]/20 text-[#2997ff] inline-flex items-center justify-center transition-colors"
                              title="แชร์เอกสาร"
                            >
                              <Share2 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="w-8 h-8 rounded-full hover:bg-[#ff3b30]/20 text-[#ff3b30] inline-flex items-center justify-center transition-colors"
                            title="ลบเอกสาร"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-20 text-[#ffffff]/50 text-[17px] font-light">
                        ไม่พบเอกสารในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

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
                className="bg-[#272729] rounded-[18px] border border-[#ffffff]/10 p-8 w-full max-w-lg relative z-10 shadow-2xl"
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
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">ไฟล์ PDF</label>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      required
                      className="block w-full text-[14px] text-[#ffffff]/70
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-[14px] file:font-semibold
                        file:bg-[#ffffff]/10 file:text-white
                        hover:file:bg-[#ffffff]/20 transition-colors"
                      onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#0066cc] hover:bg-[#0071e3] text-white rounded-full text-[17px] font-medium h-[44px] mt-8 flex items-center justify-center transition-colors">
                    ยืนยันการอัปโหลด
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {isShareModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsShareModalOpen(false)}
                className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="bg-[#272729] rounded-[18px] border border-[#ffffff]/10 p-8 w-full max-w-md relative z-10 shadow-2xl"
              >
                <button 
                  onClick={() => setIsShareModalOpen(false)} 
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#ffffff]/10 flex items-center justify-center hover:bg-[#ffffff]/20 text-white transition-colors"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#2997ff]/20 rounded-full flex items-center justify-center text-[#2997ff]">
                    <Share2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[24px] tracking-tight text-white">แชร์เอกสาร</h3>
                    <p className="text-[14px] text-[#ffffff]/60">เลือกผู้ใช้งานที่คุณต้องการให้สิทธิ์</p>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {dummyUsers.filter(u => u.username !== user?.username).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-[#000000]/50 border border-[#ffffff]/10 rounded-[11px]">
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-[#ffffff]/50" />
                        <div>
                          <p className="font-medium text-[15px] text-white">{u.full_name}</p>
                          <p className="text-[12px] text-[#ffffff]/50">@{u.username}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleShare(u.id)}
                        className="bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-white rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors"
                      >
                        ส่งสิทธิ์
                      </button>
                    </div>
                  ))}
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
