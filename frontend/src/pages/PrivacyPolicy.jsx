import React, { useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() { 
  useDocumentTitle('นโยบายความเป็นส่วนตัว');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#000000] min-h-screen text-white selection:bg-[#2997ff] selection:text-white font-[system-ui,-apple-system,sans-serif]">
      <PublicNavbar />

      <main className="pt-[120px] pb-32 px-4">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-[800px] mx-auto"
        >
          <header className="mb-16">
            <h1 className="text-[40px] md:text-[56px] font-semibold tracking-[-0.04em] leading-[1.1] text-white mb-6">
              นโยบายความเป็นส่วนตัว
            </h1>
            <p className="text-[17px] text-[#ffffff]/60 font-normal tracking-[-0.374px] leading-[1.47]">
              อัปเดตล่าสุด: 1 พฤษภาคม 2026
            </p>
          </header>

          <div className="space-y-12 text-[17px] text-[#ffffff]/80 font-normal tracking-[-0.374px] leading-[1.47]">
            
            <section>
              <p className="mb-4 text-[21px] leading-[1.47] text-[#ffffff]">
                ที่ Docsys เราให้ความสำคัญกับความเป็นส่วนตัวของคุณเป็นอันดับแรก นโยบายนี้อธิบายถึงวิธีการที่เรารวบรวม ใช้งาน และปกป้องข้อมูลส่วนบุคคลของคุณ
              </p>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">1. ข้อมูลที่เรารวบรวม</h2>
              <p className="mb-4">เราอาจรวบรวมข้อมูลประเภทต่อไปนี้เมื่อคุณใช้งานแพลตฟอร์ม:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>ข้อมูลบัญชี:</strong> ชื่อ, ที่อยู่อีเมล, รหัสผ่าน (ถูกเข้ารหัส) และบทบาทของคุณในระบบ (Admin/User)</li>
                <li><strong>ข้อมูลเอกสาร:</strong> ไฟล์ที่คุณอัปโหลด ชื่อไฟล์ ขนาดไฟล์ และข้อมูล Meta ของไฟล์</li>
                <li><strong>ข้อมูลการใช้งาน:</strong> ประวัติการเข้าสู่ระบบ ประวัติการดาวน์โหลด และข้อมูลการโต้ตอบกับระบบ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">2. การนำข้อมูลไปใช้งาน</h2>
              <p className="mb-4">เราใช้ข้อมูลที่เก็บรวบรวมเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>เพื่อให้บริการระบบคลังเอกสารของคุณ (การจัดเก็บ ค้นหา และแชร์ไฟล์)</li>
                <li>เพื่อตรวจสอบสิทธิ์การเข้าถึงและความปลอดภัยของบัญชี</li>
                <li>เพื่อปรับปรุงประสิทธิภาพการทำงานของแพลตฟอร์ม (ผ่านทางสถิติที่ไม่ระบุตัวตน)</li>
                <li>เพื่อแจ้งเตือนเกี่ยวกับการอัปเดตระบบหรือเหตุการณ์ด้านความปลอดภัยที่สำคัญ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">3. การปกป้องและการจัดเก็บข้อมูล</h2>
              <p className="mb-4">
                ข้อมูลของคุณจะถูกจัดเก็บในเซิร์ฟเวอร์ที่มีความปลอดภัยสูง รหัสผ่านของคุณถูกเข้ารหัสลับ (Hashing) และเอกสารของคุณจะสามารถเข้าถึงได้เฉพาะผู้ที่มีสิทธิ์เท่านั้น เราไม่นำข้อมูลของคุณไปขายให้กับบุคคลที่สามโดยเด็ดขาด
              </p>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">4. สิทธิ์ของคุณ (GDPR & PDPA)</h2>
              <p className="mb-4">
                คุณมีสิทธิ์เข้าถึง แก้ไข หรือขอลบข้อมูลส่วนบุคคลและเอกสารของคุณได้ตลอดเวลาผ่านทางหน้าต่างจัดการเอกสารและโปรไฟล์ของคุณ หากต้องการเพิกถอนความยินยอมในการใช้งานระบบ สามารถติดต่อผู้ดูแลระบบเพื่อทำการลบบัญชีอย่างถาวร
              </p>
            </section>

          </div>
        </motion.article>
      </main>

      <PublicFooter />
    </div>
  );
}
