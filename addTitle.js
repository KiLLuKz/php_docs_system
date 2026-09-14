const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend/src/pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const page of pages) {
    if (page === 'Login.jsx') continue;
    let title = page.replace('.jsx', '');
    if (title === 'LandingPage') title = '';
    else if (title === 'Register') title = 'Register';
    else if (title === 'Dashboard') title = 'Dashboard';
    else if (title === 'ManageDocuments') title = 'จัดการเอกสาร';
    else if (title === 'AdminUsers') title = 'จัดการผู้ใช้งาน';
    else if (title === 'PrivacyPolicy') title = 'นโยบายความเป็นส่วนตัว';
    else if (title === 'TermsOfService') title = 'ข้อกำหนดการใช้งาน';

    const p = path.join(pagesDir, page);
    let content = fs.readFileSync(p, 'utf8');

    if (!content.includes('useDocumentTitle')) {
        // Insert import
        content = content.replace(/(import .*;\n)/, `$1import useDocumentTitle from '../hooks/useDocumentTitle';\n`);
        
        // Insert hook
        content = content.replace(/export default function [A-Za-z0-9_]+\([^)]*\)\s*\{/, `$& \n  useDocumentTitle('${title}');`);
        fs.writeFileSync(p, content, 'utf8');
        console.log(`Updated ${page}`);
    }
}
