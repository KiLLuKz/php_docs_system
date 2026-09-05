import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = ({ type = 'info', title, message, onConfirm = null }) => {
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
              <div className="w-full flex border-t border-[#ffffff]/10 mt-auto">
                {alertConfig.onConfirm ? (
                  <>
                    <button 
                      onClick={closeAlert}
                      className="flex-1 py-3 text-[17px] font-normal text-[#2997ff] border-r border-[#ffffff]/10 hover:bg-[#ffffff]/5 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      onClick={handleConfirm}
                      className={`flex-1 py-3 text-[17px] font-semibold transition-colors hover:bg-[#ffffff]/5 ${
                        alertConfig.type === 'danger' ? 'text-[#ff3b30]' : 'text-[#2997ff]'
                      }`}
                    >
                      ตกลง
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={closeAlert}
                    className="w-full py-3 text-[17px] font-semibold text-[#2997ff] hover:bg-[#ffffff]/5 transition-colors"
                  >
                    ตกลง
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
