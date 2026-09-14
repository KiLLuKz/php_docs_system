import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = ({ type = 'info', title, message, onConfirm = null }) => {
    // If no onConfirm callback is needed, use Sonner toast for a modern non-blocking notification
    if (!onConfirm) {
      if (type === 'danger' || type === 'error') {
        toast.error(title || 'ข้อผิดพลาด', { description: message });
      } else if (type === 'success') {
        toast.success(title || 'สำเร็จ', { description: message });
      } else if (type === 'warning') {
        toast.warning(title || 'แจ้งเตือน', { description: message });
      } else {
        toast.info(title || 'ข้อมูล', { description: message });
      }
      return;
    }

    // Otherwise, show the modal
    setAlertConfig({ type, title, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertConfig(null);
  };

  const handleConfirm = () => {
    if (alertConfig?.onConfirm) {
      alertConfig.onConfirm();
    }
    closeAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AnimatePresence>
        {alertConfig && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAlert}
              className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md"
            />
            
            {/* Alert Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-[#272729]/80 backdrop-blur-xl border border-[#ffffff]/10 rounded-[18px] w-full max-w-[320px] relative z-10 overflow-hidden shadow-[0_5px_30px_rgba(0,0,0,0.3)] flex flex-col items-center text-center pt-6"
            >
              <div className="px-6 pb-6">
                <h3 className="font-semibold text-[17px] text-white tracking-tight leading-tight mb-2">
                  {alertConfig.title}
                </h3>
                <p className="text-[14px] font-normal text-[#ffffff]/70 leading-[1.3]">
                  {alertConfig.message}
                </p>
              </div>
              
              {/* Buttons Row */}
              <div className="w-full flex gap-3 p-4 md:p-5 pt-0">
                {alertConfig.onConfirm ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={closeAlert}
                      className="flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      ยกเลิก
                    </Button>
                    <Button 
                      variant={alertConfig.type === 'danger' ? 'destructive' : 'default'}
                      onClick={handleConfirm}
                      className={`flex-1 rounded-xl ${alertConfig.type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                    >
                      ตกลง
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="default"
                    onClick={closeAlert}
                    className="w-full rounded-xl bg-[#2997ff] hover:bg-[#0071e3] text-white"
                  >
                    ตกลง
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
