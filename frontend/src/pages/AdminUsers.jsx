import React, { useState, useRef, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import usePendingDeletes from '../hooks/usePendingDeletes';
import { UserPlus, Search, MoreHorizontal, Settings2, ShieldCheck, Edit, Trash2, X, UserCircle, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { toast } from 'sonner';
import axiosClient from '../api/axiosClient';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import ImageWithFallback from '../components/ImageWithFallback';

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../components/ui/sheet';

export default function AdminUsers() { 
  useDocumentTitle('จัดการผู้ใช้งาน');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: null, username: '', full_name: '', email: '', role: 'user', password: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const searchContainerRef = useRef(null);

  // Form errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
    
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users');
      if (res.data.status === 'success') {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'user',
    password: ''
  });

  const [selectedUsers, setSelectedUsers] = useState([]);

  const { user } = useAuth();


  const { showAlert } = useAlert();

  const { registerDelete, unregisterDelete } = usePendingDeletes();

  const executeDelete = (idsToDelete, itemsToDelete) => {
    const count = idsToDelete.length;

    // Optimistic Update
    setUsers(prev => prev.filter(u => !idsToDelete.includes(u.id)));
    setSelectedUsers(prev => prev.filter(id => !idsToDelete.includes(id)));

    let undone = false;
    let executed = false;
    const deleteId = Symbol('delete');

    const performDelete = async () => {
      if (undone || executed) return;
      executed = true;
      try {
        if (idsToDelete.length === 1) {
          const res = await axiosClient.delete(`/users/${idsToDelete[0]}`);
          if (res.data.status !== 'success') throw new Error(res.data.message || 'Failed to delete');
        } else {
          const res = await axiosClient.post('/users/bulk-delete', { ids: idsToDelete });
          if (res.data.status !== 'success') throw new Error(res.data.message || 'Failed to delete');
        }
      } catch (error) {
        setUsers(prev => {
          const newUsers = [...prev, ...itemsToDelete];
          return newUsers.sort((a, b) => {
            if (a.role !== b.role) {
              return a.role === 'admin' ? -1 : 1;
            }
            return a.full_name.localeCompare(b.full_name, 'th');
          });
        });
        setSelectedUsers(prev => [...prev, ...idsToDelete]);
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
          setUsers(prev => {
            const newUsers = [...prev, ...itemsToDelete];
            return newUsers.sort((a, b) => {
              if (a.role !== b.role) {
                return a.role === 'admin' ? -1 : 1;
              }
              return a.full_name.localeCompare(b.full_name, 'th');
            });
          });
          setSelectedUsers(prev => [...prev, ...idsToDelete]);
          toast.success('เลิกทำสำเร็จ');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    
    const usersToDelete = users.filter(u => selectedUsers.includes(u.id));
    const idsToDelete = [...selectedUsers];

    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล',
      message: 'คุณต้องการลบข้อมูลที่เลือกใช่หรือไม่? (การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที)',
      onConfirm: () => {
        executeDelete(idsToDelete, usersToDelete);
      }
    });
  };

  const handleDelete = (id) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล',
      message: 'คุณต้องการลบข้อมูลที่เลือกใช่หรือไม่? (การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที)',
      onConfirm: () => {
        executeDelete([id], [userToDelete]);
      }
    });
  };

  const handleCopyUsername = (username) => {
    navigator.clipboard.writeText(username);
    toast.success('คัดลอกชื่อผู้ใช้งานแล้ว', { description: username });
  };

  const handleEdit = (user) => {
    setEditFormData({ id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role, password: '' });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (submitLoadingRef.current) return;
    submitLoadingRef.current = true;
    setSubmitLoading(true);
    setErrors({});

    try {
      const res = await axiosClient.put(`/users/${editFormData.id}`, editFormData);
      if (res.data.status === 'error' && res.data.errors) {
        setErrors(res.data.errors);
        toast.error('ข้อมูลบางอย่างไม่ถูกต้อง');
      } else if (res.data.status === 'success') {
        setUsers(users.map(u => u.id === editFormData.id ? res.data.data : u));
        setIsEditModalOpen(false);
        toast.success('แก้ไขข้อมูลสำเร็จ');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการแก้ไขผู้ใช้งาน');
    } finally {
      submitLoadingRef.current = false;
      setSubmitLoading(false);
    }
  };

  const submitLoadingRef = useRef(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (submitLoadingRef.current) return;
    submitLoadingRef.current = true;
    setSubmitLoading(true);
    setErrors({});

    try {
      const res = await axiosClient.post('/users', formData);
      if (res.data.status === 'error' && res.data.errors) {
        setErrors(res.data.errors);
        toast.error('ข้อมูลบางอย่างไม่ถูกต้อง');
      } else if (res.data.status === 'success') {
        setUsers([...users, res.data.data]);
        setIsModalOpen(false);
        setFormData({ username: '', full_name: '', email: '', role: 'user', password: '' });
        toast.success('เพิ่มผู้ใช้งานสำเร็จ');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
    } finally {
      submitLoadingRef.current = false;
      setSubmitLoading(false);
    }
  };

  // 1. Fuzzy Search setup
  const fuse = new Fuse(users, {
    keys: ['full_name', 'username', 'email'],
    threshold: 0.3,
  });

  // 2. Apply Fuzzy Search
  const searchResults = searchTerm 
    ? fuse.search(searchTerm).map(result => result.item) 
    : users;

  // 3. Apply Role Filter
  const filteredUsers = searchResults.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  // Recommendations for the dropdown
  const recommendResults = searchTerm ? searchResults.slice(0, 5) : [];

  const selectableUsers = filteredUsers.filter(u => String(u.id) !== String(user?.id));
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const isAllSelected = selectableUsers.length > 0 && selectableUsers.every(u => selectedUsers.includes(u.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers(selectedUsers.filter(id => !selectableUsers.find(u => u.id === id)));
    } else {
      const newSelected = new Set([...selectedUsers, ...selectableUsers.map(u => u.id)]);
      setSelectedUsers(Array.from(newSelected));
    }
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(selectedId => selectedId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  return (
    <div className="w-full bg-[#000000] min-h-screen pb-12 text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-7xl pt-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">จัดการผู้ใช้งาน</h1>
            <p className="text-white/50 text-base md:text-[1.1rem] mt-2">เพิ่ม แก้ไข หรือลบผู้ใช้งานในระบบ</p>
          </div>
          <Button 
            onClick={() => {
              setErrors({});
              setIsModalOpen(true);
            }}
            className="rounded-xl h-11 md:h-12 px-6 text-sm md:text-base bg-[#0066cc] hover:bg-[#0055b3] text-white font-medium"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Top Actions: Search & Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 z-10 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              
              {/* Search with Recommend Dropdown */}
              <div className="relative w-full sm:w-80 md:w-96" ref={searchContainerRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
                <Input 
                  placeholder="ค้นหาชื่อ, อีเมล, ผู้ใช้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="pl-10 h-11 md:h-12 text-sm md:text-base bg-[#1c1c1e] border-white/10 text-white rounded-xl focus-visible:ring-0 focus-visible:border-white/20 w-full"
                />
                
                <AnimatePresence>
                  {isSearchFocused && searchTerm && recommendResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 text-xs md:text-sm font-semibold text-white/40 uppercase tracking-wider">
                        แนะนำ (Recommendations)
                      </div>
                      <ul>
                        {recommendResults.map(user => (
                          <li 
                            key={`rec-${user.id}`}
                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                            onClick={() => {
                              setSearchTerm(user.full_name);
                              setIsSearchFocused(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm md:text-base text-white">{user.full_name}</span>
                              <span className="text-xs md:text-sm text-white/50">{user.email}</span>
                            </div>
                            <span className="text-xs md:text-sm text-white/30 bg-white/5 px-2.5 py-1.5 rounded">{user.role}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Role Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 md:h-12 px-4 text-sm md:text-base rounded-xl border-white/10 bg-[#1c1c1e] text-white hover:bg-white/5 hover:text-white shrink-0">
                    <Settings2 className="w-4.5 h-4.5 mr-2" />
                    {roleFilter === 'all' ? 'ทุกสิทธิ์การใช้งาน' : roleFilter === 'admin' ? 'เฉพาะ Admin' : 'เฉพาะ User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1c1c1e] border-white/10 text-white rounded-xl shadow-2xl p-1.5">
                  <DropdownMenuItem 
                    onClick={() => setRoleFilter('all')}
                    className="text-sm md:text-base py-2.5 px-3 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer flex justify-between"
                  >
                    ทั้งหมด {roleFilter === 'all' && <Check className="w-4.5 h-4.5 text-[#2997ff]" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setRoleFilter('admin')}
                    className="text-sm md:text-base py-2.5 px-3 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer flex justify-between"
                  >
                    Admin {roleFilter === 'admin' && <Check className="w-4.5 h-4.5 text-[#2997ff]" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setRoleFilter('user')}
                    className="text-sm md:text-base py-2.5 px-3 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer flex justify-between"
                  >
                    User {roleFilter === 'user' && <Check className="w-4.5 h-4.5 text-[#2997ff]" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-end min-h-[44px]">
            <AnimatePresence>
              {selectedUsers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  className="flex items-center gap-3 bg-[#272729] border border-[#333333] px-4 py-2 rounded-xl shadow-none"
                >
                  <span className="text-sm font-medium text-white/80">เลือก {selectedUsers.length} รายการ</span>
                  <div className="w-[1px] h-4 bg-[#333333] mx-1"></div>
                  <Button 
                    variant="ghost"
                    onClick={() => setSelectedUsers([])}
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

          {/* Table Container */}
          <div className="rounded-2xl border border-white/10 bg-[#1c1c1e] overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-black/20 border-b border-white/10">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="w-14 text-center text-white/50 font-medium">
                    <input 
                      type="checkbox" 
                      className="rounded bg-black/40 border-white/20 accent-[#0066cc] cursor-pointer w-4 h-4" 
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-white/50 font-medium py-4 text-sm md:text-base">ผู้ใช้งาน</TableHead>
                  <TableHead className="hidden md:table-cell text-white/50 font-medium py-4 text-sm md:text-base">ชื่อผู้ใช้</TableHead>
                  <TableHead className="hidden md:table-cell text-white/50 font-medium py-4 text-sm md:text-base">อีเมล</TableHead>
                  <TableHead className="text-white/50 font-medium py-4 text-sm md:text-base">สิทธิ์</TableHead>
                  <TableHead className="w-16 md:w-20 text-right text-white/50 font-medium py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="border-b border-white/5">
                        <TableCell className="py-4 text-center">
                          <Skeleton className="w-4 h-4 bg-white/5 mx-auto rounded" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-11 h-11 bg-white/5 rounded-full shrink-0" />
                            <div className="flex flex-col gap-2 w-full">
                              <Skeleton className="h-4 w-32 bg-white/10" />
                              <Skeleton className="h-3 w-24 bg-white/5 md:hidden" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4">
                          <Skeleton className="h-4 w-28 bg-white/5" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4">
                          <Skeleton className="h-4 w-40 bg-white/5" />
                        </TableCell>
                        <TableCell className="py-4">
                          <Skeleton className="h-4 w-20 bg-white/5" />
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Skeleton className="h-8 w-8 bg-white/5 rounded-md ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((u) => (
                        <TableRow 
                          key={u.id}
                          className={`border-b border-white/5 transition-colors group ${selectedUsers.includes(u.id) ? 'bg-white/10 hover:bg-white/15' : 'hover:bg-white/5'}`}
                        >
                          <TableCell className="text-center py-3 md:py-4">
                            <input 
                              type="checkbox" 
                              className="rounded bg-black/40 border-white/20 accent-[#0066cc] cursor-pointer w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed" 
                              checked={selectedUsers.includes(u.id)}
                              onChange={() => toggleSelectUser(u.id)}
                              disabled={String(u.id) === String(user?.id)}
                            />
                          </TableCell>
                          <TableCell className="py-3 md:py-4">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 flex items-center justify-center text-white/70 shrink-0 overflow-hidden">
                                {u.profile_image ? (
                                  <ImageWithFallback src={`/api/uploads/profiles/${u.profile_image}`} alt={u.full_name} className="object-cover" />
                                ) : (
                                  <span className="uppercase text-sm font-semibold">{u.username.substring(0, 2)}</span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-white/90 text-sm md:text-base truncate">{u.full_name}</span>
                                  <span className="text-xs text-white/50 md:hidden truncate">#{u.username}</span>
                                </div>
                                <span className="text-xs text-white/40 md:hidden truncate">{u.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-4 text-white/70 text-sm md:text-base">
                            {u.username}
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-4 text-white/70 text-sm md:text-base">
                            {u.email}
                          </TableCell>
                          <TableCell className="py-3 md:py-4">
                            <div className="flex items-center gap-1.5 md:gap-3 text-xs md:text-base">
                              {u.role === 'admin' ? (
                                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#2997ff]" />
                              ) : (
                                <UserCircle className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
                              )}
                              <span className="capitalize text-white/80">{u.role}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-3 md:py-4 pr-4 md:pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 md:w-56 bg-[#1c1c1e] border-white/10 text-white rounded-xl shadow-2xl p-1.5">
                                <DropdownMenuItem 
                                  onClick={() => handleCopyUsername(u.username)}
                                  className="text-sm md:text-base py-2.5 px-3 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                >
                                  <Copy className="w-4.5 h-4.5 mr-2.5 text-white/60" /> คัดลอก Username
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(u)}
                                  className="text-sm md:text-base py-2.5 px-3 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                >
                                  <Edit className="w-4.5 h-4.5 mr-2.5 text-white/60" /> แก้ไขข้อมูล
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10 my-1.5" />
                                {u.id != user?.id && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(u.id)}
                                    disabled={u.username === 'admin'}
                                    className="text-sm md:text-base py-2.5 px-3 rounded-lg text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-4.5 h-4.5 mr-2.5" /> ลบผู้ใช้งาน
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-40 text-center text-white/50 text-base">
                          ไม่พบผู้ใช้งานที่ค้นหา
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination Footer */}
            <div className="flex items-center justify-between p-5 border-t border-white/5 bg-black/20 text-sm md:text-base text-white/50">
              <div>แสดง {paginatedUsers.length} จาก {filteredUsers.length} รายการ</div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base rounded-lg border-white/10 bg-transparent text-white/70 hover:bg-white/5" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </Button>
                <span className="text-white">หน้า {currentPage} จาก {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base rounded-lg border-white/10 bg-transparent text-white/70 hover:bg-white/5" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Add User Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 z-[100] bg-[#000000]/80 backdrop-blur-sm"
              />
              
              {/* Sliding Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-[110] w-full sm:w-[450px] bg-[#1c1c1e] border-l border-white/10 shadow-2xl p-6 md:p-10 text-white overflow-y-auto"
              >
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-8 mt-2">
                  <h3 className="font-semibold text-2xl md:text-3xl tracking-tight text-white">เพิ่มผู้ใช้ใหม่</h3>
                </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div>
                <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">ชื่อ-นามสกุล</label>
                <Input 
                  type="text" 
                  required
                  className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 rounded-xl h-12 md:h-14 text-base md:text-lg" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">ชื่อผู้ใช้ (Username)</label>
                      <Input 
                        type="text" 
                        required
                        className={`bg-black/40 border-white/10 text-white focus-visible:ring-0 rounded-xl h-12 md:h-14 text-base md:text-lg ${
                          errors.username ? 'border-red-500 focus-visible:border-red-500' : 'focus-visible:border-white/20'
                        }`} 
                        value={formData.username}
                        onChange={e => {
                          setFormData({...formData, username: e.target.value});
                          if (errors.username) setErrors({...errors, username: null});
                        }}
                      />
                      {errors.username && (
                        <p className="text-red-400 text-xs md:text-sm mt-2 ml-1">{errors.username}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">รหัสผ่าน</label>
                      <Input 
                        type="password" 
                        required
                        className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 rounded-xl h-12 md:h-14 text-base md:text-lg" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">อีเมล</label>
                    <Input 
                      type="email" 
                      required
                      className={`bg-black/40 border-white/10 text-white focus-visible:ring-0 rounded-xl h-12 md:h-14 text-base md:text-lg ${
                        errors.email ? 'border-red-500 focus-visible:border-red-500' : 'focus-visible:border-white/20'
                      }`} 
                      value={formData.email}
                      onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        if (errors.email) setErrors({...errors, email: null});
                      }}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs md:text-sm mt-2 ml-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">สิทธิ์การใช้งาน</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full justify-between bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/20 text-white focus-visible:ring-0 focus-visible:border-white/20 rounded-xl h-12 md:h-14 text-base md:text-lg px-4 font-normal"
                        >
                          {formData.role === 'admin' ? 'Admin (ผู้ดูแลระบบ)' : 'User (ผู้ใช้ทั่วไป)'}
                          <ChevronDown className="w-5 h-5 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent style={{ zIndex: 9999 }} className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#1c1c1e] border-white/10 text-white rounded-xl shadow-2xl p-1.5">
                        <DropdownMenuItem 
                          onClick={() => setFormData({...formData, role: 'user'})}
                          className="text-base md:text-lg py-3 px-4 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                        >
                          User (ผู้ใช้ทั่วไป)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setFormData({...formData, role: 'admin'})}
                          className="text-base md:text-lg py-3 px-4 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                        >
                          Admin (ผู้ดูแลระบบ)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button type="submit" disabled={submitLoading} className="w-full rounded-xl bg-[#0066cc] hover:bg-[#0055b3] text-white font-medium h-12 md:h-14 text-base md:text-lg mt-8">
                    {submitLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        เพิ่มผู้ใช้งาน
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Edit User Modal */}
        <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto bg-[#1c1c1e] border-l border-white/10 text-white p-6 md:p-10">
            <SheetHeader className="mb-8 mt-2 text-left">
              <SheetTitle className="font-semibold text-2xl md:text-3xl tracking-tight text-white">แก้ไขผู้ใช้งาน</SheetTitle>
              <SheetDescription className="hidden">แก้ไขข้อมูลส่วนตัวและสิทธิ์ของผู้ใช้งาน</SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">ชื่อ-นามสกุล</label>
                <Input 
                  type="text" 
                  required
                  className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 rounded-xl h-12 md:h-14 text-base md:text-lg" 
                  value={editFormData.full_name}
                  onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                />
              </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">ชื่อผู้ใช้ (Username)</label>
                      <Input 
                        type="text" 
                        required
                        className={`bg-black/40 border-white/10 text-white focus-visible:ring-0 rounded-xl h-12 md:h-14 text-base md:text-lg ${
                          errors.username ? 'border-red-500 focus-visible:border-red-500' : 'focus-visible:border-white/20'
                        }`} 
                        value={editFormData.username}
                        onChange={e => {
                          setEditFormData({...editFormData, username: e.target.value});
                          if (errors.username) setErrors({...errors, username: null});
                        }}
                      />
                      {errors.username && (
                        <p className="text-red-400 text-xs md:text-sm mt-2 ml-1">{errors.username}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">รหัสผ่าน (เว้นว่างได้)</label>
                      <Input 
                        type="password" 
                        className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 rounded-xl h-12 md:h-14 text-base md:text-lg" 
                        value={editFormData.password}
                        onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">อีเมล</label>
                    <Input 
                      type="email" 
                      required
                      className={`bg-black/40 border-white/10 text-white focus-visible:ring-0 rounded-xl h-12 md:h-14 text-base md:text-lg ${
                        errors.email ? 'border-red-500 focus-visible:border-red-500' : 'focus-visible:border-white/20'
                      }`} 
                      value={editFormData.email}
                      onChange={e => {
                        setEditFormData({...editFormData, email: e.target.value});
                        if (errors.email) setErrors({...errors, email: null});
                      }}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs md:text-sm mt-2 ml-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm md:text-base text-white/80 mb-2 font-medium">สิทธิ์การใช้งาน</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full justify-between bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/20 text-white focus-visible:ring-0 focus-visible:border-white/20 rounded-xl h-12 md:h-14 text-base md:text-lg px-4 font-normal"
                        >
                          {editFormData.role === 'admin' ? 'Admin (ผู้ดูแลระบบ)' : 'User (ผู้ใช้ทั่วไป)'}
                          <ChevronDown className="w-5 h-5 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent style={{ zIndex: 9999 }} className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#1c1c1e] border-white/10 text-white rounded-xl shadow-2xl p-1.5">
                        <DropdownMenuItem 
                          onClick={() => setEditFormData({...editFormData, role: 'user'})}
                          className="text-base md:text-lg py-3 px-4 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                        >
                          User (ผู้ใช้ทั่วไป)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setEditFormData({...editFormData, role: 'admin'})}
                          className="text-base md:text-lg py-3 px-4 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                        >
                          Admin (ผู้ดูแลระบบ)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button type="submit" disabled={submitLoading} className="w-full rounded-xl bg-[#0066cc] hover:bg-[#0055b3] text-white font-medium h-12 md:h-14 text-base md:text-lg mt-8">
                    {submitLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <Edit className="w-5 h-5 mr-2" />
                        บันทึกการแก้ไข
                      </>
                    )}
                  </Button>
                </form>
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
