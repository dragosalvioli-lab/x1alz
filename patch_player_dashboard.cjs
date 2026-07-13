const fs = require('fs');
let code = fs.readFileSync('src/components/PlayerDashboard.tsx', 'utf-8');

// Inputs
code = code.replace(/<input\s+type="text"\s+value=\{inviteCode\}\s+onChange=\{\(e\) => setInviteCode\(e\.target\.value\.toUpperCase\(\)\)\}\s+placeholder="CÓDIGO"\s+className="bg-\[#111111\] border border-white\/10 rounded-lg px-4 py-3 text-sm text-center font-mono font-bold tracking-widest text-white focus:outline-none focus:border-neon-cyan transition-colors w-full uppercase"\s+\/>/g, '<input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" className="mmorpg-input rounded-sm px-4 py-3 text-sm text-center font-mono font-bold tracking-widest text-white w-full uppercase" />');

code = code.replace(/<input\s+type="number"\s+value=\{betAmount\}\s+onChange=\{\(e\) => setBetAmount\(e\.target\.value\)\}\s+placeholder="EX: 1000000000 \(1B\)"\s+className="bg-\[#111111\] border border-white\/10 rounded-lg px-4 py-3 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-gold-cabal transition-colors w-full"\s+\/>/g, '<input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} placeholder="EX: 1000000000 (1B)" className="mmorpg-input border-white/10 rounded-sm px-4 py-3 text-sm text-center font-mono font-bold text-white focus:border-gold-cabal w-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]" />');

// "Meu Personagem" Card stats
code = code.replace(/<div className="bg-\[#0A0A0A\] rounded-xl p-4 border border-white\/5 flex flex-col items-center justify-center relative overflow-hidden">/g, '<div className="glass-panel border border-white/5 rounded-sm p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/20 transition-all">');

fs.writeFileSync('src/components/PlayerDashboard.tsx', code);
