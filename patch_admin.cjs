const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Cards
code = code.replace(/<div className="p-4 bg-\[#0A0A0A\] border border-white\/5 rounded-xl">/g, '<div className="glass-panel border border-white/5 rounded-sm p-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">');

// Table Headers
code = code.replace(/<thead className="bg-\[#0A0A0A\] border-b border-white\/5">/g, '<thead className="bg-white/5 border-b border-white/10 backdrop-blur-sm">');
code = code.replace(/<th className="text-left py-3 px-4 text-xs font-bold text-neutral-400 uppercase">/g, '<th className="text-left py-3 px-4 text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">');
code = code.replace(/<th className="text-right py-3 px-4 text-xs font-bold text-neutral-400 uppercase">/g, '<th className="text-right py-3 px-4 text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">');
code = code.replace(/<th className="py-3 px-4 text-left font-bold text-xs uppercase text-neutral-400">/g, '<th className="text-left py-3 px-4 text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">');
code = code.replace(/<th className="py-3 px-4 text-left font-bold text-xs uppercase text-neutral-400 text-right">/g, '<th className="text-right py-3 px-4 text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">');

// Table rows
code = code.replace(/<tr\s+key=\{[\s\S]*?\}\s+className="border-b border-white\/5 hover:bg-white\/\[0\.02\] transition-colors">/g, (match) => match.replace('border-b border-white/5 hover:bg-white/[0.02] transition-colors', 'mmorpg-table border-b border-white/5'));
code = code.replace(/<tr key=\{.*?\} className="border-b border-neutral-800 hover:bg-neutral-900\/50">/g, '<tr className="mmorpg-table border-b border-white/5">');

// Tickets list style
code = code.replace(/bg-neutral-950/g, 'glass-panel');
code = code.replace(/bg-neutral-900/g, 'bg-white/5');
code = code.replace(/bg-\[#0A0A0A\]/g, 'bg-transparent');
code = code.replace(/border-neutral-800/g, 'border-white/5');
code = code.replace(/text-neutral-500/g, 'text-gray-500');
code = code.replace(/text-neutral-400/g, 'text-gray-400');
code = code.replace(/text-neutral-300/g, 'text-gray-300');
code = code.replace(/text-neutral-200/g, 'text-gray-200');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
