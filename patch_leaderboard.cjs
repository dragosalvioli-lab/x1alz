const fs = require('fs');
let code = fs.readFileSync('src/components/Leaderboard.tsx', 'utf-8');

// Container
code = code.replace(/<div className="bg-\[#0A0A0A\] rounded-xl border border-white\/5 overflow-hidden">/, '<div className="glass-panel rounded-sm border border-white/5 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">');

// Table header
code = code.replace(/<thead className="bg-\[#111111\] border-b border-white\/5">/, '<thead className="bg-white/5 border-b border-white/10 backdrop-blur-sm">');
code = code.replace(/<th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">/g, '<th className="px-6 py-4 text-left text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">');
code = code.replace(/<th className="px-6 py-4 text-right text-xs font-mono text-gray-500 uppercase tracking-wider">/g, '<th className="px-6 py-4 text-right text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest">');

// Table row mapping
code = code.replace(/<tr\s+key=\{index\}\s+className="border-b border-white\/5 hover:bg-white\/\[0\.02\] transition-colors"/g, '<tr key={index} className="mmorpg-table border-b border-white/5">');

// Highlight rank 1, 2, 3
code = code.replace(/<span className="text-gray-500 font-mono text-sm">\{index \+ 1\}<\/span>/, `{index === 0 ? <span className="text-gold-cabal text-glow-gold text-lg drop-shadow-[0_0_5px_#D4AF37]">1</span> : index === 1 ? <span className="text-gray-300 text-lg drop-shadow-[0_0_5px_#fff]">2</span> : index === 2 ? <span className="text-amber-700 text-lg drop-shadow-[0_0_5px_#b45309]">3</span> : <span className="text-gray-600 font-mono text-sm">{index + 1}</span>}`);

fs.writeFileSync('src/components/Leaderboard.tsx', code);
