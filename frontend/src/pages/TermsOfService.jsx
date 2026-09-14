import React, { useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { motion } from 'framer-motion';

export default function TermsOfService() { 
  useDocumentTitle('ข้อกำหนดการใช้งาน');
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
              ข้อกำหนดการใช้งาน
            </h1>
            <p className="text-[17px] text-[#ffffff]/60 font-normal tracking-[-0.374px] leading-[1.47]">
              อัปเดตล่าสุด: 1 พฤษภาคม 2026
            </p>
          </header>

          <div className="space-y-12 text-[17px] text-[#ffffff]/80 font-normal tracking-[-0.374px] leading-[1.47]">
            
            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">1. การยอมรับข้อตกลง</h2>
              <p className="mb-4">
                การที่คุณเข้าถึงและใช้งานเว็บไซต์ Docsys ถือว่าคุณได้อ่าน ทำความเข้าใจ และตกลงที่จะผูกพันตามข้อกำหนดการใช้งานนี้ หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ โปรดงดการใช้งานระบบของเรา
              </p>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">2. บัญชีผู้ใช้และความปลอดภัย</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>คุณต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันเมื่อลงทะเบียนสร้างบัญชี</li>
                <li>คุณมีหน้าที่รับผิดชอบแต่เพียงผู้เดียวในการรักษารหัสผ่านของบัญชีให้เป็นความลับ</li>
                <li>การกระทำใดๆ ที่เกิดขึ้นภายใต้บัญชีของคุณ ถือเป็นการกระทำที่คุณต้องรับผิดชอบโดยสมบูรณ์</li>
                <li>ไม่อนุญาตให้ใช้บัญชีผู้อื่นโดยไม่ได้รับความยินยอม</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">3. ข้อกำหนดเกี่ยวกับเอกสารและเนื้อหา</h2>
              <p className="mb-4">
                คุณยังคงเป็นเจ้าของลิขสิทธิ์ในเอกสารที่คุณอัปโหลดเข้าระบบ อย่างไรก็ตาม คุณยืนยันและรับรองว่า:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>คุณมีสิทธิ์ที่ถูกต้องตามกฎหมายในการอัปโหลดและแชร์เอกสารนั้นๆ</li>
                <li>เอกสารจะต้องไม่เป็นสิ่งที่ผิดกฎหมาย ละเมิดสิทธิ์ผู้อื่น หรือมีลักษณะที่สร้างความเสียหายต่อบุคคลหรือองค์กรใดๆ</li>
                <li>ทางเราขอสงวนสิทธิ์ในการลบหรือระงับการเข้าถึงเอกสารที่ละเมิดข้อกำหนดโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">4. ขอบเขตการให้บริการ</h2>
              <p className="mb-4">
                Docsys ให้บริการระบบคลังเอกสารในรูปแบบ "ตามที่เป็น" (As-Is) ทางเราพยายามอย่างเต็มที่ในการรักษาเสถียรภาพและความปลอดภัยของระบบ แต่ไม่สามารถรับประกันได้ว่าระบบจะทำงานได้อย่างสมบูรณ์แบบโดยปราศจากข้อบกพร่องหรือการหยุดชะงัก
              </p>
            </section>

            <section>
              <h2 className="text-[28px] font-semibold tracking-[0.196px] text-white mb-4 leading-[1.14]">5. การระงับและการยกเลิกบัญชี</h2>
              <p className="mb-4">
                เราอาจระงับหรือยกเลิกการเข้าถึงบริการของคุณทันที หากคุณละเมิดข้อกำหนดเหล่านี้ หรือมีพฤติกรรมที่เสี่ยงต่อการก่อให้เกิดความเสียหายทางกฎหมายหรือทางธุรกิจต่อแพลตฟอร์ม
              </p>
            </section>

          </div>
        </motion.article>
      </main>

      <PublicFooter />
    </div>
  );
}
