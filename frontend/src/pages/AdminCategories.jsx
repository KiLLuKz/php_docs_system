import React, { useState, useEffect, useMemo } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axiosClient from '../api/axiosClient';
import { Folder, Trash2, Search, Edit2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function AdminCategories() {
  useDocumentTitle('Admin Categories');
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', color: '#3b82f6' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const executeDelete = (idsToDelete, itemsToDelete) => {
    const count = idsToDelete.length;
    
    // Optimistic Update
    setCategories(prev => prev.filter(cat => !idsToDelete.includes(cat.id)));
    setRowSelection(prev => {
      const next = { ...prev };
      idsToDelete.forEach(id => delete next[id]);
      return next;
    });

    let undone = false;

    const timeoutId = setTimeout(async () => {
      if (!undone) {
        try {
          const res = await axiosClient.delete('/admin/categories/bulk', { data: { ids: idsToDelete } });
          if (res.data.status !== 'success') {
             throw new Error('Failed to delete');
          }
        } catch (error) {
          setCategories(prev => {
            const newCats = [...prev, ...itemsToDelete];
            return newCats.sort((a, b) => a.id - b.id);
          });
          setRowSelection(prev => {
            const next = { ...prev };
            idsToDelete.forEach(id => { next[id] = true; });
            return next;
          });
          toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      }
    }, 5000);

    toast.success(`ลบ ${count} รายการแล้ว`, {
      duration: 5000,
      action: {
        label: 'เลิกทำ (Undo)',
        onClick: () => {
          undone = true;
          clearTimeout(timeoutId);
          setCategories(prev => {
            const newCats = [...prev, ...itemsToDelete];
            return newCats.sort((a, b) => a.id - b.id);
          });
          setRowSelection(prev => {
            const next = { ...prev };
            idsToDelete.forEach(id => { next[id] = true; });
            return next;
          });
          toast.success('เลิกทำสำเร็จ');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return;
    
    const itemsToDelete = selectedRows.map(row => row.original);
    const idsToDelete = itemsToDelete.map(cat => cat.id);
    
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบหมวดหมู่',
      message: 'คุณต้องการลบหมวดหมู่ที่เลือกใช่หรือไม่? (หากมีเอกสารในหมวดหมู่เหล่านี้ จะถูกเปลี่ยนเป็นไม่มีหมวดหมู่) การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที',
      onConfirm: () => {
        executeDelete(idsToDelete, itemsToDelete);
      }
    });
  };

  const handleDelete = (cat) => {
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบหมวดหมู่',
      message: 'คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่? (หากมีเอกสารในหมวดหมู่นี้ จะถูกเปลี่ยนเป็นไม่มีหมวดหมู่) การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที',
      onConfirm: () => {
        executeDelete([cat.id], [cat]);
      }
    });
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setCurrentCategory({ id: null, name: '', color: '#3b82f6' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat) => {
    setDialogMode('edit');
    setCurrentCategory({ id: cat.id, name: cat.name, color: cat.color || '#3b82f6' });
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!currentCategory.name.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSaving(true);
    try {
      if (dialogMode === 'add') {
        await axiosClient.post('/admin/categories', {
          name: currentCategory.name,
          color: currentCategory.color,
        });
        toast.success('เพิ่มหมวดหมู่สำเร็จ');
      } else {
        await axiosClient.put(`/admin/categories/${currentCategory.id}`, {
          name: currentCategory.name,
          color: currentCategory.color,
        });
        toast.success('แก้ไขหมวดหมู่สำเร็จ');
      }
      setIsDialogOpen(false);
      fetchData(); // Reload data to get accurate counts and IDs
    } catch (error) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center w-full">
          <input
            type="checkbox"
            className="rounded bg-black border-[#333333] accent-white cursor-pointer w-4 h-4"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-full">
          <input
            type="checkbox"
            className="rounded bg-black border-[#333333] accent-white cursor-pointer w-4 h-4"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      size: 50,
    },
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#333333]/50 flex items-center justify-center shrink-0 border border-[#333333]">
              <Folder className="w-5 h-5" style={{ color: cat.color || '#3b82f6' }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-white/90 text-sm truncate">{cat.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                <span className="text-xs text-white/40 truncate font-light">{cat.color || '#3b82f6'}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'document_count',
      header: 'Documents',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/10 text-white">
          {row.original.document_count || 0} รายการ
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end pr-4 gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 transition-colors" 
            onClick={(e) => { e.stopPropagation(); openEditDialog(row.original); }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors" 
            onClick={(e) => { e.stopPropagation(); handleDelete(row.original); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 80,
    }
  ], [categories]);

  const table = useReactTable({
    data: categories,
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: row => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full bg-[#000000] min-h-screen pb-12 text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-[1440px] pt-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Admin Categories</h1>
            <p className="text-white/50 mt-1.5 text-sm md:text-base font-light">จัดการหมวดหมู่ทั้งหมดในระบบ พร้อมระบบ 5-Second Undo</p>
          </div>
          <Button 
            onClick={openAddDialog}
            className="bg-white text-black hover:bg-white/90 h-[42px] px-6 rounded-xl font-medium shadow-sm transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มหมวดหมู่
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 z-10 relative">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-white/40" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาตามชื่อหมวดหมู่..." 
              className="w-full pl-11 pr-4 bg-[#272729] rounded-xl border border-[#333333] focus:border-white/50 focus:ring-1 focus:ring-white/50 text-sm text-white h-[42px] outline-none transition-all"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="flex items-center gap-3 bg-[#272729] border border-[#333333] px-4 py-2 rounded-xl shadow-lg w-full md:w-auto"
              >
                <span className="text-sm font-medium text-white/80">เลือก {selectedCount} รายการ</span>
                <div className="w-[1px] h-4 bg-[#333333] mx-1"></div>
                <Button 
                  onClick={handleBulkDelete}
                  className="h-8 px-3 text-xs md:text-sm rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  ลบ
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Data Table */}
        <div className="bg-[#272729] rounded-2xl border border-[#333333] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b border-[#333333] bg-[#2a2a2c]/50">
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}
                        className="py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#333333]/50">
                      <td className="py-4 px-4"><Skeleton className="w-4 h-4 bg-white/5 mx-auto rounded" /></td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 bg-white/5 rounded-lg shrink-0" />
                          <div className="flex flex-col gap-2 w-full">
                            <Skeleton className="h-4 w-3/4 bg-white/10" />
                            <Skeleton className="h-3 w-1/2 bg-white/5" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><Skeleton className="h-6 w-16 bg-white/5 rounded-md" /></td>
                      <td className="py-4 px-4 text-right"><Skeleton className="h-8 w-16 bg-white/5 rounded-md ml-auto" /></td>
                    </tr>
                  ))
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      className={`border-b border-[#333333] transition-colors ${row.getIsSelected() ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-3 px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center text-white/40 text-sm">
                      ไม่พบหมวดหมู่
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1c1c1e] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {dialogMode === 'add' ? 'เพิ่มหมวดหมู่' : 'แก้ไขหมวดหมู่'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white/70">ชื่อหมวดหมู่</Label>
              <Input
                id="name"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder="เช่น การเงิน, บุคคล, ทั่วไป"
                className="bg-white/5 border-white/10 text-white focus:border-white/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color" className="text-white/70">สี (Color Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={currentCategory.color || '#3b82f6'}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                  className="w-12 h-10 p-1 bg-white/5 border-white/10 rounded-md cursor-pointer"
                />
                <Input
                  value={currentCategory.color || '#3b82f6'}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="bg-white/5 border-white/10 text-white focus:border-white/30 flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
              disabled={isSaving}
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSaveCategory} 
              className="bg-white text-black hover:bg-white/90"
              disabled={isSaving}
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
