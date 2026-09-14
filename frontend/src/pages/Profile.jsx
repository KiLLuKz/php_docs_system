import React, { useState, useRef, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { UserCircle, Mail, Briefcase, Hash, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axiosClient from '../api/axiosClient';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

export default function Profile() { 
  useDocumentTitle('Profile');
  const { user, login, fetchUser } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        password: ''
      });
      if (user.profile_image) {
        setPreviewImage(`/api/uploads/profiles/${user.profile_image}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์มีขนาดเกิน 5MB');
        return;
      }
      setCrop(undefined); // Makes crop preview update between images.
      setCompletedCrop(null);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  }

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width, height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop); // Ensure completedCrop is set even if user doesn't drag
  }

  async function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0, 0, crop.width, crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { console.error('Canvas is empty'); return; }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, 'cropped.jpg');
      setProfileImage(new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' }));
      setPreviewImage(URL.createObjectURL(croppedBlob));
      setIsCropModalOpen(false);
    }
  };

  const isDirty = 
    formData.full_name !== (user?.full_name || '') ||
    formData.email !== (user?.email || '') ||
    formData.username !== (user?.username || '') ||
    formData.password !== '' ||
    profileImage !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    setIsLoading(true);

    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('email', formData.email);
    data.append('username', formData.username);
    if (formData.password) {
      data.append('password', formData.password);
    }
    if (profileImage) {
      data.append('profile_image', profileImage);
    }

    try {
      const response = await axiosClient.post('/auth/me', data);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success(result.message || 'อัปเดตโปรไฟล์สำเร็จ');
        await fetchUser();
        // Reset states so button goes back to disabled
        setProfileImage(null);
      } else {
        toast.error(result.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้ (การเชื่อมต่อล้มเหลว)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 md:px-12 lg:px-20 max-w-7xl pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">ข้อมูลส่วนตัว</h1>
            <p className="text-white/50 text-base md:text-[1.1rem]">จัดการข้อมูลบัญชีและตั้งค่าโปรไฟล์ของคุณ</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-white/5 overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={120} className="text-white/20" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Camera className="text-white" size={44} />
                </div>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full h-11 px-6 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white text-base"
                >
                  เปลี่ยนรูปภาพ
                </Button>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={onSelectFile}
                  onClick={(e) => { e.target.value = null; }}
                />
                <p className="text-sm md:text-base text-white/40 mt-4">รองรับ JPG, PNG, WEBP</p>
              </div>
            </div>

            {/* Profile Form Section */}
            <div>
              <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <form onSubmit={handleSubmit}>
                  <div className="p-6 md:p-10 border-b border-white/5">
                    <h2 className="text-xl md:text-2xl font-medium text-white mb-2">รายละเอียดบัญชี</h2>
                    <p className="text-sm md:text-base text-white/50">อัปเดตข้อมูลส่วนตัวของคุณที่นี่</p>
                  </div>
                  <div className="p-6 md:p-10 space-y-8">
                    
                    <div className="space-y-3">
                      <Label htmlFor="full_name" className="text-white/80 text-base">ชื่อ-นามสกุล</Label>
                      <Input 
                        id="full_name" 
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 h-12 md:h-14 text-base md:text-lg rounded-xl"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-white/80 text-base">อีเมล</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 h-12 md:h-14 text-base md:text-lg rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-white/80 text-base">ชื่อผู้ใช้งาน</Label>
                        <Input 
                          id="username" 
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="bg-black/40 border-white/10 text-white focus-visible:ring-0 focus-visible:border-white/20 h-12 md:h-14 text-base md:text-lg rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-8 border-t border-white/5">
                      <Label htmlFor="password" className="text-white/80 text-base">รหัสผ่านใหม่ (ไม่บังคับ)</Label>
                      <Input 
                        id="password" 
                        name="password"
                        type="password"
                        placeholder="ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 h-12 md:h-14 text-base md:text-lg rounded-xl"
                      />
                      <p className="text-sm md:text-base text-white/40 pt-1">หากไม่ต้องการเปลี่ยนรหัสผ่าน ไม่ต้องกรอกช่องนี้</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-5 md:p-6 border border-white/5 flex items-center gap-5 mt-8">
                      <div className="bg-white/10 p-3 rounded-full">
                        <Briefcase className="text-white/70" size={24} />
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-medium text-white/90 mb-1">สิทธิ์การใช้งานของคุณ: <span className="uppercase text-[#2997ff]">{user?.role}</span></p>
                        <p className="text-sm md:text-base text-white/50">คุณไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้</p>
                      </div>
                    </div>

                  </div>
                  <div className="p-6 md:p-8 bg-black/20 border-t border-white/5 flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => window.history.back()} className="rounded-xl h-12 px-6 text-base text-white/70 hover:text-white hover:bg-white/5">
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={isLoading || !isDirty} className={`rounded-xl h-12 px-8 text-base text-white ${isDirty ? 'bg-[#0066cc] hover:bg-[#0055b3]' : 'bg-white/10 opacity-50 cursor-not-allowed'}`}>
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                      บันทึกข้อมูล
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#1c1c1e] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>ปรับแต่งรูปโปรไฟล์</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {!!imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '60vh' }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCropModalOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleCropComplete} className="bg-[#0066cc] text-white hover:bg-[#0055b3]">ตกลง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
