const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace root div
code = code.replace(
  /<div id="app-root" className="min-h-screen bg-\[#050505\] text-gray-100 flex font-sans selection:bg-neon-cyan selection:text-neutral-900 relative pb-16">/,
  '<div id="app-root" className="min-h-screen bg-transparent text-gray-100 flex font-sans selection:bg-neon-cyan selection:text-neutral-900 relative pb-16">'
);

// Sidebar improvements
const sidebarRegex = /<aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white\/10 bg-\[#0A0A0A\]">/;
code = code.replace(sidebarRegex, '<aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/5 glass-panel z-10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">');

// Branding
const brandingRegex = /<h1 className="font-display font-bold text-2xl tracking-tighter text-white">X1<span className="text-neon-cyan">ALZ<\/span><\/h1>/;
code = code.replace(brandingRegex, '<h1 className="font-display font-black text-3xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">X1<span className="text-neon-cyan text-glow-cyan">ALZ</span></h1>');

// Nav buttons
const navButtonRegex = /className=\{`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 \$\{[\s\S]*?`\}/g;
code = code.replace(navButtonRegex, `className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-wide uppercase text-xs border border-transparent \${
                  infoSection === null 
                  ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
                }\`}`);

// Mobile Bottom Nav
const mobileNavRegex = /<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white\/10 bg-\[#0A0A0A\]\/95 backdrop-blur-md z-50 flex justify-around p-2">/;
code = code.replace(mobileNavRegex, '<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/5 glass-panel z-50 flex justify-around p-2 pb-safe shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">');

// Header
const headerRegex = /<header className="flex items-center justify-between border-b border-white\/10 bg-\[#0A0A0A\]\/85 px-4 md:px-8 py-4 backdrop-blur-md sticky top-0 z-40">/;
code = code.replace(headerRegex, '<header className="flex items-center justify-between border-b border-white/5 glass-panel px-4 md:px-8 py-4 sticky top-0 z-40 shadow-[0_5px_30px_rgba(0,0,0,0.5)]">');

// Welcome message
const welcomeRegex = /<div className="mb-6 flex items-center gap-2\.5 px-4 py-2\.5 bg-\[#0A0A0A\]\/40 border border-white\/5 rounded-xl text-xxs font-mono text-gray-400">/;
code = code.replace(welcomeRegex, '<div className="mb-6 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gold-cabal/10 to-transparent border border-gold-cabal/20 rounded-sm text-[10px] font-mono text-gold-cabal/80 uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.05)]">');

// Active Rooms grid
const roomsGridRegex = /<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">/g;
code = code.replace(roomsGridRegex, '<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">');

fs.writeFileSync('src/App.tsx', code);
