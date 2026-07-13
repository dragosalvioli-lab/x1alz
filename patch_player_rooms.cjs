const fs = require('fs');
let code = fs.readFileSync('src/components/PlayerDashboard.tsx', 'utf-8');

// The main room container inside PlayerDashboard
code = code.replace(/<div className="bg-\[#0A0A0A\] border border-white\/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-white\/10 transition-all">/g, 
'<div className="glass-panel mmorpg-table border border-white/5 hover:border-neon-cyan/50 rounded-sm p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]">');

fs.writeFileSync('src/components/PlayerDashboard.tsx', code);
