const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const navRegex = /<nav className="flex-1 space-y-1 px-4">[\s\S]*?<\/nav>/;
const newNav = `<nav className="flex-1 space-y-1 px-4 mt-4">
          <button 
            onClick={() => { setInfoSection(null); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              !infoSection 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <Swords className={\`w-5 h-5 \${!infoSection ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Salas de Duelo</span>
          </button>

          <button 
            onClick={() => { setInfoSection('chat'); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              infoSection === 'chat' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <MessageSquare className={\`w-5 h-5 \${infoSection === 'chat' ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Taverna (Chat)</span>
          </button>
          
          <button 
            onClick={() => { setInfoSection('history'); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              infoSection === 'history' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <History className={\`w-5 h-5 \${infoSection === 'history' ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Histórico</span>
          </button>

          <button 
            onClick={() => { setInfoSection('ranking'); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              infoSection === 'ranking' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <Trophy className={\`w-5 h-5 \${infoSection === 'ranking' ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Ranking</span>
          </button>

          <button 
            onClick={() => { setInfoSection('rules'); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              infoSection === 'rules' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <FileText className={\`w-5 h-5 \${infoSection === 'rules' ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Regras</span>
          </button>

          <button 
            onClick={() => { setInfoSection('how_to'); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              infoSection === 'how_to' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <HelpCircle className={\`w-5 h-5 \${infoSection === 'how_to' ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Como Funciona</span>
          </button>

          <button 
            onClick={() => { setInfoSection('support'); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer \${
              infoSection === 'support' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}
          >
            <HeartHandshake className={\`w-5 h-5 \${infoSection === 'support' ? 'text-neon-cyan' : 'text-gray-500'}\`} />
            <span>Suporte</span>
          </button>
        </nav>`;

code = code.replace(navRegex, newNav);

fs.writeFileSync('src/App.tsx', code);
