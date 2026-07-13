const fs = require('fs');
let code = fs.readFileSync('src/components/ChatBox.tsx', 'utf-8');

// Replace standard backgrounds
code = code.replace(/bg-\[#0A0A0A\]/g, 'glass-panel');
code = code.replace(/bg-neutral-950/g, 'bg-white/5');
code = code.replace(/bg-neutral-900/g, 'bg-white/5 hover:bg-white/10');
code = code.replace(/border-neutral-800/g, 'border-white/10');

// Input field
code = code.replace(/className="flex-1 bg-\[#0A0A0A\] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 transition-colors"/g, 'className="flex-1 mmorpg-input rounded-sm px-3 py-2 text-xs transition-colors"');

// Send button
code = code.replace(/className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-cyan-400 hover:bg-neutral-800 hover:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"/g, 'className="p-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-sm text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,229,255,0.2)]"');

// Chat bubbles
code = code.replace(/className=\{`px-3 py-2 rounded-lg text-xs max-w-\[85%\] \$\{/g, 'className={`px-3 py-2 rounded-sm text-xs max-w-[85%] shadow-[0_0_10px_rgba(0,0,0,0.5)] ${');
code = code.replace(/'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tr-none'/g, "'glass-panel border border-white/10 text-white rounded-tr-none'");
code = code.replace(/'bg-cyan-950\/40 border border-cyan-900\/50 text-cyan-50 rounded-tl-none'/g, "'bg-gradient-to-r from-neon-cyan/20 to-transparent border border-neon-cyan/30 text-neon-cyan rounded-tl-none'");

// Tab buttons
code = code.replace(/text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950\/10/g, 'text-neon-cyan border-b-2 border-neon-cyan bg-neon-cyan/10 text-glow-cyan');
code = code.replace(/text-amber-400 border-b-2 border-amber-400 bg-amber-950\/10/g, 'text-gold-cabal border-b-2 border-gold-cabal bg-gold-cabal/10 text-glow-gold');

// Texts
code = code.replace(/text-neutral-500/g, 'text-gray-500');
code = code.replace(/text-neutral-400/g, 'text-gray-400');
code = code.replace(/text-neutral-200/g, 'text-gray-200');

fs.writeFileSync('src/components/ChatBox.tsx', code);
