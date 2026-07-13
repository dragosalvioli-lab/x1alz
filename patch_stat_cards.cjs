const fs = require('fs');
let code = fs.readFileSync('src/components/PlayerDashboard.tsx', 'utf-8');

const statCardRegex = /<div className="p-5 bg-neutral-900 border border-white\/10 rounded-xl relative overflow-hidden group hover:border-(.*?)\/20 transition-all shadow-md">/g;
code = code.replace(statCardRegex, '<div className="glass-panel mmorpg-table border border-white/10 rounded-sm p-5 relative overflow-hidden group hover:border-$1/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1">');

fs.writeFileSync('src/components/PlayerDashboard.tsx', code);
