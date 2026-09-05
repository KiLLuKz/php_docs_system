import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Beams from '../components/Beams';
import PublicFooter from '../components/PublicFooter';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login', { username, password });
      if (res.data.status === 'success') {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/dashboard'; 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-[system-ui,-apple-system,sans-serif] selection:bg-[#2997ff] selection:text-white">
      <div className="flex flex-1 flex-col md:flex-row relative">
        
        {/* Left Side: Beams Background */}
        <div className="absolute inset-0 md:relative md:w-[60%] lg:w-[65%] z-0 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Beams
                beamWidth={3}
                beamHeight={30}
                beamNumber={20}
                lightColor="#c3c2ff"
                speed={2}
                noiseIntensity={1.75}
                scale={0.2}
                rotation={30}
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-[#000000]/20 pointer-events-none"></div>
          
          <div className="absolute top-8 left-8 z-10 hidden md:block">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <ShieldCheck size={28} className="text-[#2997ff]" />
              <span className="text-[20px] font-semibold tracking-[-0.374px]">DocPortal</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="relative z-10 w-full md:w-[40%] lg:w-[35%] flex flex-col justify-center min-h-screen px-6 py-12 md:px-12 bg-[#1d1d1f]/60 md:bg-[#1d1d1f]/95 backdrop-blur-3xl md:backdrop-blur-xl border-l border-[#ffffff]/10 shadow-2xl">
          
          <div className="md:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <ShieldCheck size={28} className="text-[#2997ff]" />
              <span className="text-[20px] font-semibold tracking-[-0.374px]">DocPortal</span>
            </Link>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <div className="flex flex-col items-start mb-10">
              <Link to="/" className="flex items-center gap-1 text-[13px] text-[#ffffff]/60 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={16} /> กลับไปหน้าหลัก
              </Link>
              <h2 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.04em] leading-tight mb-3">
                เข้าสู่ระบบ
              </h2>
              <p className="text-[15px] text-[#ffffff]/60 tracking-tight">
                ระบบดาวน์โหลดเอกสารส่วนบุคคล
              </p>
            </div>

            {error && (
              <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#ff3b30] rounded-[12px] mb-6 p-4 flex text-[14px]">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="ชื่อผู้ใช้งาน (Username)" 
                  className="w-full rounded-[12px] border border-[#ffffff]/10 focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] px-4 h-[50px] bg-[#000000]/40 text-white placeholder:text-[#ffffff]/30 text-[15px] transition-all outline-none" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="รหัสผ่าน (Password)" 
                    className="w-full rounded-[12px] border border-[#ffffff]/10 focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] px-4 pr-12 h-[50px] bg-[#000000]/40 text-white placeholder:text-[#ffffff]/30 text-[15px] transition-all outline-none" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-1 pr-3 flex items-center text-[#ffffff]/40 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2 pb-4">
                <a href="#" onClick={(e) => { e.preventDefault(); alert('ฟังก์ชันลืมรหัสผ่านกำลังอยู่ระหว่างพัฒนาครับ'); }} className="text-[13px] text-[#2997ff] hover:underline underline-offset-4 tracking-tight">
                  ลืมรหัสผ่าน?
                </a>
              </div>

              <div>
                <button type="submit" className="w-full bg-[#0066cc] text-white hover:bg-[#0071e3] rounded-[12px] h-[50px] text-[17px] font-medium active:scale-95 transition-all duration-200" disabled={loading}>
                  {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
                </button>
              </div>
              
              <div className="text-center mt-6 pt-4 text-[14px]">
                <span className="text-[#ffffff]/60 tracking-tight">ยังไม่มีบัญชีผู้ใช้? </span>
                <Link to="/register" className="text-[#2997ff] font-medium hover:underline underline-offset-4 tracking-tight">
                  สมัครสมาชิกที่นี่
                </Link>
              </div>
            </form>
            
            <div className="mt-10 text-center text-[12px] text-[#ffffff]/30 border-t border-[#ffffff]/10 pt-6">
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
