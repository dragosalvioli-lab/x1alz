const fs = require('fs');
let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf-8');

// Replace backgrounds
code = code.replace(/bg-neutral-900\/80/g, 'glass-panel');
code = code.replace(/bg-neutral-800\/50/g, 'bg-white/5');

// Inputs
const oldInputRegex = /className="w-full bg-\[#0A0A0A\] border border-neutral-800 rounded-lg pl-10 pr-4 py-2\.5 text-sm text-neutral-200 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan\/50 transition-all placeholder:text-neutral-600"/g;
code = code.replace(oldInputRegex, 'className="w-full mmorpg-input rounded-sm pl-10 pr-4 py-3 text-sm"');

fs.writeFileSync('src/components/AuthScreen.tsx', code);
