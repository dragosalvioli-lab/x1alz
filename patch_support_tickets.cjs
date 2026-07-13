const fs = require('fs');
let code = fs.readFileSync('src/components/SupportTickets.tsx', 'utf-8');

// Container
code = code.replace(/<div className="space-y-4 flex flex-col min-h-\[400px\]">/, '<div className="space-y-4 flex flex-col min-h-[400px] h-full">');

// List mode buttons
const listButtonRegex = /className="w-full flex items-center justify-between p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-colors cursor-pointer text-left"/g;
code = code.replace(listButtonRegex, 'className="w-full flex items-center justify-between p-4 mmorpg-table glass-panel hover:bg-white/5 border border-white/5 hover:border-neon-cyan/50 rounded-sm transition-all cursor-pointer text-left shadow-[0_0_10px_rgba(0,0,0,0.5)] group"');

// Form inputs
code = code.replace(/className="w-full bg-\[#0A0A0A\] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500"/g, 'className="w-full mmorpg-input rounded-sm px-4 py-3 text-sm"');
code = code.replace(/className="w-full flex-1 bg-\[#0A0A0A\] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500 resize-none"/g, 'className="w-full flex-1 mmorpg-input rounded-sm px-4 py-3 text-sm resize-none"');
code = code.replace(/className="flex-1 bg-\[#0A0A0A\] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500"/g, 'className="flex-1 mmorpg-input rounded-sm px-4 py-3 text-sm"');

// Status colors
code = code.replace(/bg-green-500\/10 border-green-500\/30 text-green-400/g, 'bg-win-neon/10 border-win-neon/30 text-win-neon shadow-[0_0_10px_rgba(57,255,20,0.2)]');
code = code.replace(/bg-amber-500\/10 border-amber-500\/30 text-amber-400/g, 'bg-gold-cabal/10 border-gold-cabal/30 text-gold-cabal shadow-[0_0_10px_rgba(212,175,55,0.2)]');

// Chat bubbles in view mode
code = code.replace(/bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tr-none/g, 'glass-panel border-white/10 text-white rounded-tr-none shadow-[0_0_10px_rgba(0,0,0,0.5)]');
code = code.replace(/bg-cyan-950\/40 border border-cyan-900\/50 text-cyan-50 rounded-tl-none/g, 'bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/30 text-neon-cyan rounded-tl-none shadow-[0_0_15px_rgba(0,229,255,0.1)]');

// Change standard button
code = code.replace(/className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-cyan-400 hover:bg-neutral-800 hover:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"/g, 'className="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-sm text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all cursor-pointer disabled:opacity-30 shadow-[0_0_10px_rgba(0,229,255,0.2)]"');

fs.writeFileSync('src/components/SupportTickets.tsx', code);
