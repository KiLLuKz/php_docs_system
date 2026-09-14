const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Docsys')) {
        const newContent = content.replace(/Docsys/g, 'Docsys');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'uploads') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.html') || fullPath.endsWith('.sql'))) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(__dirname);
