import React, { useState, useEffect, useMemo } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axiosClient from '../api/axiosClient';
import { FileText, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import DocumentPreview from '../components/DocumentPreview';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '../components/ui/button';

export default function AdminDocuments() {
  useDocumentTitle('Admin Documents');
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/documents?mode=admin');
      setDocuments(res.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('ไม่สามารถโหลดข้อมูลเอกสารได้');
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
    setDocuments(prev => prev.filter(doc => !idsToDelete.includes(doc.id)));
    setRowSelection(prev => {
      const next = { ...prev };
      idsToDelete.forEach(id => delete next[id]);
      return next;
    });

    let undone = false;

    const timeoutId = setTimeout(async () => {
      if (!undone) {
        try {
          const res = await axiosClient.delete('/admin/documents/bulk', { data: { ids: idsToDelete } });
          if (res.data.status !== 'success') {
             throw new Error('Failed to delete');
          }
        } catch (error) {
          setDocuments(prev => {
            const newDocs = [...prev, ...itemsToDelete];
            return newDocs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          });
          setRowSelection(prev => {
            const next = { ...prev };
            idsToDelete.forEach(id => { next[id] = true; });
            return next;
          });
          toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
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
          setDocuments(prev => {
            const newDocs = [...prev, ...itemsToDelete];
            return newDocs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    const idsToDelete = itemsToDelete.map(doc => doc.id);
    
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล',
      message: 'คุณต้องการลบข้อมูลที่เลือกใช่หรือไม่? (การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที)',
      onConfirm: () => {
        executeDelete(idsToDelete, itemsToDelete);
      }
    });
  };

  const handleDelete = (doc) => {
    showAlert({
      type: 'danger',
      title: 'ยืนยันการลบข้อมูล',
      message: 'คุณต้องการลบข้อมูลที่เลือกใช่หรือไม่? (การกระทำนี้สามารถเลิกทำได้ภายใน 5 วินาที)',
      onConfirm: () => {
        executeDelete([doc.id], [doc]);
      }
    });
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
        toast.error('ไม่สามารถดาวน์โหลดได้ หรือคุณไม่มีสิทธิ์เข้าถึงเอกสารนี้');
      });
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
      accessorKey: 'title',
      header: 'File Name',
      cell: ({ row }) => {
        const doc = row.original;
        const isImage = doc.file_path && /\.(jpeg|jpg|png|gif|webp)$/i.test(doc.file_path);
        const token = localStorage.getItem('token') || '';
        const previewUrl = `${axiosClient.defaults.baseURL}/documents/preview/${doc.id}?token=${token}`;
        
        return (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedPreviewDoc(doc)}>
            <div className="w-10 h-10 rounded-lg bg-[#333333]/50 flex items-center justify-center text-white/50 shrink-0 overflow-hidden border border-[#333333]">
              {isImage ? (
                <img src={previewUrl} alt={doc.title} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-white/90 text-sm group-hover:text-white transition-colors truncate">{doc.title}</span>
              <span className="text-xs text-white/40 truncate font-light mt-0.5">{doc.description || 'ไม่มีคำอธิบาย'}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'category_name',
      header: 'Category',
      cell: ({ row }) => <span className="text-white/60 text-sm">{row.original.category_name || '-'}</span>
    },
    {
      id: 'uploader',
      header: 'Uploader Name',
      cell: ({ row }) => {
        const name = row.original.creator_name || row.original.creator_username || row.original.created_by || '-';
        return <span className="text-white/60 text-sm">{name}</span>;
      }
    },
    {
      accessorKey: 'is_public',
      header: 'Privacy Status',
      cell: ({ row }) => {
        const isPublic = row.original.is_public == 1;
        return (
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide ${isPublic ? 'bg-white/10 text-white' : 'bg-transparent border border-[#333333] text-white/60'}`}>
            {isPublic ? 'Public' : 'Private'}
          </span>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Upload Date',
      cell: ({ row }) => <span className="text-white/50 text-sm font-light">{new Date(row.original.created_at).toLocaleDateString('th-TH')}</span>
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end pr-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 transition-colors" 
            onClick={(e) => { e.stopPropagation(); handleDelete(row.original); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 60,
    }
  ], [documents]);

  const table = useReactTable({
    data: documents,
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
            <h1 className="text-3xl font-semibold tracking-tight text-white">Admin Documents</h1>
            <p className="text-white/50 mt-1.5 text-sm md:text-base font-light">จัดการเอกสารทั้งหมดในระบบ พร้อมระบบ 5-Second Undo</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 z-10 relative">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-white/40" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาตามชื่อไฟล์..." 
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
                  className="h-8 px-3 text-xs md:text-sm rounded-lg bg-white text-black hover:bg-white/90 font-medium"
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
                      <td className="py-4 px-4"><Skeleton className="h-4 w-20 bg-white/5" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-4 w-24 bg-white/5" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-6 w-16 bg-white/5 rounded-md" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-4 w-24 bg-white/5" /></td>
                      <td className="py-4 px-4 text-right"><Skeleton className="h-8 w-8 bg-white/5 rounded-md ml-auto" /></td>
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
                      ไม่พบเอกสาร
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
