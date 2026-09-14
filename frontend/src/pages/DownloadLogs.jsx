import React, { useState, useEffect, useMemo } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export default function DownloadLogs() {
  useDocumentTitle('ประวัติดาวน์โหลด');
  const { user } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchData = async () => {
    try {
      const res = await axiosClient.get('/admin/logs');
      if (res.data.status === 'success') {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const columns = useMemo(() => [
    {
      accessorKey: 'document_title',
      header: 'ชื่อเอกสาร',
      cell: info => <span className="font-medium">{info.getValue() || 'Unknown Document'}</span>,
    },
    {
      accessorFn: row => `${row.user_name || ''} ${row.user_email || ''}`,
      id: 'downloader',
      header: 'ผู้ดาวน์โหลด',
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-white/90">{row.user_name || 'Unknown User'}</span>
            {row.user_email && <span className="text-xs text-white/50">{row.user_email}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'ip_address',
      header: 'ไอพีแอดเดรส',
      cell: info => <span className="text-white/70 font-mono text-sm">{info.getValue()}</span>,
    },
    {
      accessorKey: 'downloaded_at',
      header: 'วันที่ดาวน์โหลด',
      cell: info => (
        <span className="text-white/70 text-sm">
          {new Date(info.getValue()).toLocaleString('th-TH')}
        </span>
      ),
    }
  ], []);

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full bg-[#000000] min-h-screen pb-12 text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-[1440px] pt-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2997ff]/20 rounded-full flex items-center justify-center text-[#2997ff] shrink-0">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-[40px] font-semibold tracking-tight text-white">ประวัติดาวน์โหลด</h1>
              <p className="text-[#ffffff]/60 mt-1 text-[18px] font-light">ประวัติการเข้าถึงและดาวน์โหลดเอกสาร (สิทธิ์ผู้ดูแลระบบ)</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#ffffff]/40" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อเอกสาร, ชื่อผู้ใช้ หรืออีเมล..." 
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-11 pr-4 bg-[#272729] rounded-[11px] border border-[#e0e0e0]/20 focus:border-[#2997ff] text-[15px] text-white h-[44px] outline-none transition-colors"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1c1c1e] rounded-[18px] border border-white/10 overflow-hidden shadow-2xl"
        >
          <Table>
            <TableHeader className="bg-black/20 border-b border-white/10">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-white/10">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="text-white/50 font-medium py-4 text-sm md:text-base whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="border-b border-white/5">
                      <TableCell className="py-4"><Skeleton className="h-5 w-3/4 bg-white/10" /></TableCell>
                      <TableCell className="py-4"><Skeleton className="h-5 w-1/2 bg-white/10" /></TableCell>
                      <TableCell className="py-4"><Skeleton className="h-5 w-1/3 bg-white/10" /></TableCell>
                      <TableCell className="py-4"><Skeleton className="h-5 w-1/3 bg-white/10" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-3 md:py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center text-white/50 text-base">
                    ไม่พบข้อมูลการดาวน์โหลด
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20">
            <span className="text-sm text-white/50">
              หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
