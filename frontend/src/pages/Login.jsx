import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Beams from '../components/Beams';
import PublicFooter from '../components/PublicFooter';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Login() {
  useDocumentTitle('Login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login', { username, password });
      if (res.data.status === 'success') {
        localStorage.setItem('token', res.data.token);
        setTimeout(() => {
          window.location.href = '/dashboard'; 
        }, 500);
        return;
      }
    } catch (err) {
      toast.error('เข้าสู่ระบบไม่สำเร็จ', { 
        description: err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' 
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-[system-ui,-apple-system,sans-serif] selection:bg-primary selection:text-white">
      <div className="flex flex-1 flex-col md:flex-row relative">
        
        {/* Left Side: Beams Background */}
        <div className="absolute inset-0 md:relative md:w-[60%] lg:w-[65%] z-0 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Beams
              beamWidth={3}
              beamHeight={30}
              beamNumber={25}
              lightColor="#90abfe"
              speed={3}
              noiseIntensity={1.8}
              scale={0.2}
              rotation={45}
            />
            </div>
          </div>
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
          
          <div className="absolute top-8 left-8 z-10 hidden md:block">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <ShieldCheck size={28} className="text-[#2997ff]" />
              <span className="text-[20px] font-semibold tracking-[-0.374px]">Docsys</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="relative z-10 w-full md:w-[40%] lg:w-[35%] flex flex-col justify-center min-h-screen px-6 py-12 md:px-12 bg-black/60 md:bg-black/80 backdrop-blur-3xl md:backdrop-blur-xl border-l border-white/10 shadow-2xl">
          
          <div className="md:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <ShieldCheck size={28} className="text-[#2997ff]" />
              <span className="text-[20px] font-semibold tracking-[-0.374px]">Docsys</span>
            </Link>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <Link to="/" className="flex items-center gap-1 text-[13px] text-white/60 hover:text-white mb-8 transition-colors">
              <ArrowLeft size={16} /> กลับไปหน้าหลัก
            </Link>
            
            <Card className="bg-transparent border-0 ring-0 shadow-none">
              <CardHeader className="px-0 pt-0 pb-8">
                <CardTitle className="text-[32px] md:text-[40px] font-semibold tracking-[-0.04em] leading-tight text-white">เข้าสู่ระบบ</CardTitle>
                <CardDescription className="text-[15px] text-white/60 tracking-tight">ระบบดาวน์โหลดเอกสารส่วนบุคคล</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/80">ชื่อผู้ใช้งาน</Label>
                    <Input 
                      id="username"
                      type="text" 
                      placeholder="Username" 
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-[44px] rounded-[11px] focus-visible:ring-0 focus-visible:border-white/20"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-white/80">รหัสผ่าน</Label>
                      <a href="#" onClick={(e) => { e.preventDefault(); toast.info('ฟังก์ชันลืมรหัสผ่านกำลังอยู่ระหว่างพัฒนาครับ'); }} className="text-[13px] text-primary hover:underline underline-offset-4">
                        ลืมรหัสผ่าน?
                      </a>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-[44px] pr-10 rounded-[11px] focus-visible:ring-0 focus-visible:border-white/20"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-[44px] rounded-full text-[17px] font-medium mt-6 bg-primary hover:bg-primary-focus text-white active:scale-[0.98] transition-all" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'เข้าสู่ระบบ'}
                  </Button>
                  
                  <div className="text-center mt-6 pt-4 text-[14px]">
                    <span className="text-white/60 tracking-tight">ยังไม่มีบัญชีผู้ใช้? </span>
                    <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4 tracking-tight">
                      สมัครสมาชิกที่นี่
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="mt-10 text-center text-[12px] text-white/30 border-t border-white/10 pt-6">
              <p className="mb-1">Admin ทดสอบ: admin / password</p>
              <p>User ทดสอบ: user1 / password</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Global Footer */}
      <PublicFooter />
    </div>
  );
}
