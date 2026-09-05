import React, { useState } from 'react';
import { Users, UserPlus, Trash2, X, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', full_name: 'System Administrator', email: 'admin@docportal.com', role: 'admin' },
    { id: 2, username: 'user1', full_name: 'John Doe', email: 'user1@docportal.com', role: 'user' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'user',
    password: ''
  });

  const handleDelete = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานรายนี้?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      ...formData,
      id: Date.now()
    };
    setUsers([...users, newUser]);
    setIsModalOpen(false);
    setFormData({ username: '', full_name: '', email: '', role: 'user', password: '' });
  };

  return (
    <div className="w-full bg-[#000000] min-h-screen pb-12 text-white font-[system-ui,-apple-system,sans-serif]">
      <main className="container mx-auto p-4 md:p-8 max-w-[1440px] pt-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-[40px] font-semibold tracking-tight">จัดการผู้ใช้งาน</h1>
            <p className="text-[#ffffff]/60 mt-2 text-[21px] font-light">เพิ่ม หรือลบ ผู้ใช้งานในระบบ</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary rounded-full px-6 font-medium text-[17px] h-[52px]"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#272729] rounded-[18px] border border-hairline overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-[#000000]/40 text-[14px] text-[#ffffff]/70 border-b border-hairline/50">
                <tr>
                  <th className="font-semibold tracking-wide py-5">ชื่อ-นามสกุล</th>
                  <th className="font-semibold tracking-wide py-5">ชื่อผู้ใช้ / อีเมล</th>
                  <th className="font-semibold tracking-wide py-5">สิทธิ์การใช้งาน</th>
                  <th className="text-right font-semibold tracking-wide py-5">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="hover:bg-[#ffffff]/5 transition-colors border-b border-hairline/30"
                    >
                      <td className="py-5">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <UserCircle className="w-8 h-8" />
                          </div>
                          <div className="font-semibold text-[17px]">{u.full_name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-[15px]">{u.username}</div>
                        <div className="text-[14px] text-[#ffffff]/50">{u.email}</div>
                      </td>
                      <td>
                        {u.role === 'admin' ? (
                          <span className="px-3 py-1 bg-[#ffffff]/10 text-white rounded-md text-[12px] font-medium uppercase tracking-wider">
                            Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#000000] border border-hairline text-[#ffffff]/70 rounded-md text-[12px] font-medium uppercase tracking-wider">
                            User
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="btn btn-sm btn-ghost hover:bg-error/20 text-error rounded-md"
                          title="ลบผู้ใช้งาน"
                          disabled={u.username === 'admin'} // Prevent deleting main admin
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-20 text-[#ffffff]/50 text-[17px]">
                      ไม่พบผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add User Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="bg-[#272729] rounded-[24px] border border-hairline/50 p-8 w-full max-w-lg relative z-10 shadow-2xl"
              >
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 hover:bg-[#ffffff]/10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="font-semibold text-[28px] mb-8 tracking-tight">เพิ่มผู้ใช้ใหม่</h3>
                
                <form onSubmit={handleAddSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">ชื่อ-นามสกุล</label>
                    <input 
                      type="text" 
                      required
                      className="input w-full bg-[#000000] border-hairline focus:border-primary text-[17px] rounded-xl h-[52px]" 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">ชื่อผู้ใช้ (Username)</label>
                      <input 
                        type="text" 
                        required
                        className="input w-full bg-[#000000] border-hairline focus:border-primary text-[17px] rounded-xl h-[52px]" 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">รหัสผ่าน</label>
                      <input 
                        type="password" 
                        required
                        className="input w-full bg-[#000000] border-hairline focus:border-primary text-[17px] rounded-xl h-[52px]" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">อีเมล</label>
                    <input 
                      type="email" 
                      required
                      className="input w-full bg-[#000000] border-hairline focus:border-primary text-[17px] rounded-xl h-[52px]" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] text-[#ffffff]/70 mb-2 font-medium">สิทธิ์การใช้งาน</label>
                    <select 
                      className="select w-full bg-[#000000] border-hairline focus:border-primary text-[17px] rounded-xl h-[52px]"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">User (ผู้ใช้ทั่วไป)</option>
                      <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary w-full rounded-full text-[17px] font-medium h-[52px] mt-8">
                    <UserPlus className="w-5 h-5 mr-2" />
                    เพิ่มผู้ใช้งาน
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
