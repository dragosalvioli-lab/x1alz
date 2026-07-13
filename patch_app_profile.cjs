const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<div className="mt-auto border-t border-white\/10 p-6 bg-\[#0F0F0F\]">/, '<div className="mt-auto border-t border-white/5 p-6 bg-transparent">');

fs.writeFileSync('src/App.tsx', code);
