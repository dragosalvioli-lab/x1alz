const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldMobileNavRegex = /<div className="flex md:hidden items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none scroll-smooth">[\s\S]*?<\/div>\n              <div className="flex justify-between items-center mb-6">/;
const newMobileNav = `<div className="flex md:hidden items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none scroll-smooth -mx-4 px-4">
              <button
                onClick={() => { setInfoSection(null); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  !infoSection
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Duelos
              </button>
              <button
                onClick={() => { setInfoSection('chat'); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'chat'
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Taverna
              </button>
              <button
                onClick={() => { setInfoSection('history'); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'history'
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Histórico
              </button>
              <button
                onClick={() => { setInfoSection('ranking'); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'ranking'
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Ranking
              </button>
              <button
                onClick={() => { setInfoSection('rules'); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'rules'
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Regras
              </button>
              <button
                onClick={() => { setInfoSection('how_to'); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'how_to'
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Tutorial
              </button>
              <button
                onClick={() => { setInfoSection('support'); sound.playClick(); }}
                className={\`px-4 py-2 rounded-sm border text-xs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'support'
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-black/40 border-white/10 text-gray-400 glass-panel'
                }\`}
              >
                Suporte
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-6">`;

code = code.replace(oldMobileNavRegex, newMobileNav);

// Also remove the bottom nav bar completely to simplify the UI and focus on the header/scrollable horizontal bar
const bottomNavRegex = /<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white\/5 glass-panel z-50 flex justify-around p-2 pb-safe shadow-\[0_-5px_30px_rgba\(0,0,0,0\.5\)\]">[\s\S]*?<\/nav>/;
code = code.replace(bottomNavRegex, '');

fs.writeFileSync('src/App.tsx', code);
