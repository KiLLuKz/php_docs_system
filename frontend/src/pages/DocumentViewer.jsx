import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '../components/ui/avatar';

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [documentMeta, setDocumentMeta] = useState(null);

  useDocumentTitle(documentMeta ? `กำลังดูเอกสาร: ${documentMeta.title}` : 'กำลังโหลดเอกสาร...');

  // Fetch document list to find meta info since we don't have a single document endpoint yet
  useEffect(() => {
    axiosClient.get('/documents')
      .then((res) => {
        const docs = res.data.data;
        const doc = docs.find(d => d.id.toString() === id);
        if (doc) setDocumentMeta(doc);
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/documents/preview/${id}`, { responseType: 'blob' })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
          setFileUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(true);
          setLoading(false);
        });
    }

    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [id]);

  const handleDownload = () => {
    if (!documentMeta) return;
    axiosClient.get(`/documents/download/${id}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', documentMeta.file_path.split('/').pop() || `document_${id}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => {
        alert("ไม่สามารถดาวน์โหลดได้");
      });
  };

  const isImage = documentMeta?.file_path?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-[#000000] text-white overflow-hidden">
      
      {/* Left Panel: Document Preview (Split View - 65%) */}
      <main className="w-full md:w-[65%] lg:w-[70%] relative bg-[#1c1c1e] flex items-center justify-center border-r border-white/10 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10"
        >
          <ChevronLeft size={24} />
        </Button>

        {loading && (
          <div className="w-full h-full p-8 flex items-center justify-center">
            <Skeleton className="w-full h-full bg-white/5 rounded-2xl max-w-4xl" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center bg-red-500/10 text-red-500 p-8 rounded-2xl border border-red-500/20 max-w-sm text-center">
            <AlertTriangle size={48} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">ไม่สามารถเข้าถึงไฟล์ได้</h3>
            <p className="text-sm opacity-80 mb-6">คุณอาจไม่มีสิทธิ์เข้าถึงเอกสารนี้ หรือไฟล์ถูกลบไปแล้ว</p>
            <Button variant="outline" onClick={() => navigate(-1)}>กลับไปคลังเอกสาร</Button>
          </div>
        )}

        {fileUrl && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full p-0 flex items-center justify-center bg-black/40"
          >
            {isImage ? (
              <img 
                src={fileUrl} 
                alt={documentMeta?.title} 
                className="max-w-full max-h-full object-contain shadow-2xl" 
              />
            ) : (
              <iframe 
                src={`${fileUrl}#toolbar=0`} 
                title={documentMeta?.title} 
                className="w-full h-full bg-white shadow-2xl border-none"
              />
            )}
          </motion.div>
        )}
      </main>

      {/* Right Panel: Information & Actions (Split View - 35%) */}
      <aside className="w-full md:w-[35%] lg:w-[30%] bg-[#000000] p-6 md:p-8 flex flex-col overflow-y-auto">
        <div className="flex-1">
          {documentMeta ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/10 text-[12px] font-semibold text-white/70 uppercase tracking-wider">
                  {documentMeta.category_name || 'ทั่วไป'}
                </span>
                {documentMeta.is_public ? (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[12px] font-semibold uppercase tracking-wider">
                    สาธารณะ
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-black border border-white/10 text-white/50 text-[12px] font-semibold uppercase tracking-wider">
                    ส่วนตัว
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-white mb-6">
                {documentMeta.title}
              </h1>

              <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/5 mb-8">
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">รายละเอียด</h3>
                <p className="text-white/80 leading-relaxed font-light">
                  {documentMeta.description || 'ไม่มีคำอธิบายสำหรับเอกสารนี้'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/50 text-sm">ผู้สร้าง</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={documentMeta.creator_profile_image ? `/api/uploads/profiles/${documentMeta.creator_profile_image}` : ''} />
                      <AvatarFallback>{(documentMeta.creator_name || documentMeta.creator_username || '?').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium">
                      {documentMeta.creator_name || documentMeta.creator_username} {documentMeta.created_by == user?.id && '(คุณ)'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/50 text-sm">วันที่อัปโหลด</span>
                  <span className="text-white font-medium">{new Date(documentMeta.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/50 text-sm">ขนาดไฟล์</span>
                  <span className="text-white font-medium">{documentMeta.file_size}</span>
                </div>
              </div>

              <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/5 mb-8">
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">สิทธิ์การเข้าถึงและการแชร์</h3>
                {documentMeta.is_public == 1 ? (
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
                    {documentMeta.shared_users && documentMeta.shared_users.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-white/40 text-[12px] mb-3">แชร์ให้กับ ({documentMeta.shared_users.length} คน):</p>
                        <AvatarGroup>
                          {documentMeta.shared_users.map((u, i) => (
                            <Avatar key={i} className="ring-[#1c1c1e] border border-white/10" title={u.full_name || u.username}>
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
            </motion.div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 bg-white/10 rounded-full" />
                <Skeleton className="h-6 w-16 bg-white/10 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4 bg-white/10 mb-6" />
              <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/5 mb-8">
                <Skeleton className="h-4 w-20 bg-white/5 mb-4" />
                <Skeleton className="h-4 w-full bg-white/5 mb-2" />
                <Skeleton className="h-4 w-4/5 bg-white/5" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full bg-white/5" />
                <Skeleton className="h-12 w-full bg-white/5" />
                <Skeleton className="h-12 w-full bg-white/5" />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Button 
            onClick={handleDownload} 
            disabled={!documentMeta}
            className="w-full h-14 bg-[#2997ff] hover:bg-[#0071e3] text-white text-lg font-medium rounded-2xl"
          >
            <Download className="w-5 h-5 mr-2" /> ดาวน์โหลดเอกสาร
          </Button>
        </div>
      </aside>
    </div>
  );
}
