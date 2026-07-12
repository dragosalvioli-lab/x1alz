const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const desktopHistButton = `<button 
            onClick={() => { setInfoSection('history'); sound.playClick(); }}
            className={\`w-full group flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all cursor-pointer \${
              infoSection === 'history'
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-neon-cyan shadow-[inset_2px_0_0_0_#00E5FF]'
                : 'text-gray-400 hover:text-white'
            }\`}
          >
            <History className="h-5 w-5" />
            <span className="font-medium uppercase tracking-wider text-xs">Histórico</span>
          </button>`;

const chatDesktopButton = `<button 
            onClick={() => { setInfoSection('chat'); sound.playClick(); }}
            className={\`w-full group flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all cursor-pointer \${
              infoSection === 'chat'
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-neon-cyan shadow-[inset_2px_0_0_0_#00E5FF]'
                : 'text-gray-400 hover:text-white'
            }\`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium uppercase tracking-wider text-xs">Chat da Arena</span>
          </button>
          
          <button 
            onClick={() => { setInfoSection('history'); sound.playClick(); }}`;

code = code.replace(
  /<button \n            onClick=\{\(\) => \{ setInfoSection\('history'\); sound\.playClick\(\); \}\}/,
  chatDesktopButton
);


const mobileHistButton = `<button
                onClick={() => { setInfoSection('history'); sound.playClick(); }}
                className={\`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'history'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                }\`}
              >
                📜 Histórico
              </button>`;

const mobileChatButton = `<button
                onClick={() => { setInfoSection('chat'); sound.playClick(); }}
                className={\`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer \${
                  infoSection === 'chat'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                }\`}
              >
                💬 Chat
              </button>
              
              <button
                onClick={() => { setInfoSection('history'); sound.playClick(); }}`;

code = code.replace(
  /<button\n                onClick=\{\(\) => \{ setInfoSection\('history'\); sound\.playClick\(\); \}\}/,
  mobileChatButton
);


fs.writeFileSync('src/App.tsx', code);
