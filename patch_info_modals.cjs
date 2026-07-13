const fs = require('fs');
let code = fs.readFileSync('src/components/InfoModals.tsx', 'utf-8');

// Container 
code = code.replace(/<div className="bg-\[#0A0A0A\] w-full max-w-2xl rounded-2xl border border-white\/10 shadow-2xl overflow-hidden flex flex-col max-h-\[90vh\] relative">/, '<div className="glass-panel w-full max-w-2xl rounded-sm border border-neon-cyan/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] relative">');

// Header
code = code.replace(/<div className="px-6 py-4 border-b border-white\/10 flex justify-between items-center bg-\[#0A0A0A\]\/80 backdrop-blur-md shrink-0">/, '<div className="px-6 py-4 border-b border-neon-cyan/20 flex justify-between items-center bg-gradient-to-r from-neon-cyan/10 to-transparent backdrop-blur-md shrink-0">');

// Header Title
code = code.replace(/<h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">\{getSectionTitle\(\)\}<\/h2>/, '<h2 className="font-display font-bold text-lg text-neon-cyan text-glow-cyan uppercase tracking-widest">{getSectionTitle()}</h2>');

// Close Button
code = code.replace(/<button onClick=\{onClose\} className="text-gray-500 hover:text-white transition-colors">/, '<button onClick={onClose} className="text-neon-cyan/50 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_#00E5FF] transition-all">');

// Ranking Table
code = code.replace(/<div className="bg-\[#050505\] border border-white\/5 rounded-xl overflow-hidden">/, '<div className="glass-panel border border-white/10 rounded-sm overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">');
code = code.replace(/<thead className="bg-\[#111111\] border-b border-white\/5">/g, '<thead className="bg-white/5 border-b border-white/10">');
code = code.replace(/<tr className="border-b border-white\/5 hover:bg-white\/\[0\.02\] transition-colors">/g, '<tr className="mmorpg-table border-b border-white/5">');

// Change text-neutral-300 to standard text-gray-300
code = code.replace(/text-neutral-300/g, 'text-gray-300');
code = code.replace(/text-neutral-400/g, 'text-gray-400');
code = code.replace(/text-neutral-500/g, 'text-gray-500');

fs.writeFileSync('src/components/InfoModals.tsx', code);
