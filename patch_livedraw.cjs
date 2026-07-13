const fs = require('fs');
let code = fs.readFileSync('src/components/LiveDraw.tsx', 'utf-8');

// Replace standard backgrounds
code = code.replace(/bg-neutral-950/g, 'glass-panel');
code = code.replace(/bg-neutral-900/g, 'bg-white/5');
code = code.replace(/bg-\[#0A0A0A\]/g, 'glass-panel');
code = code.replace(/border-neutral-800/g, 'border-white/10');
code = code.replace(/border-neutral-900/g, 'border-white/5');

// Texts
code = code.replace(/text-neutral-500/g, 'text-gray-500');
code = code.replace(/text-neutral-400/g, 'text-gray-400');
code = code.replace(/text-neutral-300/g, 'text-gray-300');
code = code.replace(/text-neutral-200/g, 'text-gray-200');

// Buttons / Badges
code = code.replace(/bg-cyan-950\/40 border border-cyan-500\/30/g, 'bg-gradient-to-br from-neon-cyan/20 to-transparent border border-neon-cyan/50');
code = code.replace(/text-cyan-400/g, 'text-neon-cyan');
code = code.replace(/bg-amber-950\/40 border border-amber-500\/30/g, 'bg-gradient-to-br from-gold-cabal/20 to-transparent border border-gold-cabal/50');
code = code.replace(/text-amber-400/g, 'text-gold-cabal');
code = code.replace(/border-cyan-500/g, 'border-neon-cyan');
code = code.replace(/border-amber-500/g, 'border-gold-cabal');
code = code.replace(/bg-cyan-500/g, 'bg-neon-cyan');
code = code.replace(/bg-amber-500/g, 'bg-gold-cabal');

// Adjust the big "VS" indicator
code = code.replace(/<span className="font-display font-black text-2xl text-neon-cyan animate-pulse">VS<\/span>/g, '<span className="font-display font-black text-3xl text-neon-cyan text-glow-cyan animate-pulse drop-shadow-[0_0_15px_#00E5FF]">VS</span>');

fs.writeFileSync('src/components/LiveDraw.tsx', code);
