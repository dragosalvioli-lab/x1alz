const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The replacement was messed up because of how I used string replacement on a regex with variables. 
// Let's fix the desktop sidebar buttons.

// Find all `<button \n onClick={() => { setInfoSection('something'); sound.playClick(); }}\n className={`...`}\n >`
// and replace them with a correct template based on their section.

const sections = ['chat', 'history', 'ranking', 'rules', 'how_to', 'support'];

for (const section of sections) {
  const btnRegex = new RegExp(\`<button\\\\s+onClick=\\{\\(\\) => \\{ setInfoSection\\('\${section}'\\); sound\\.playClick\\(\\); \\}\\}\\\\s+className=\\{\\\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-wide uppercase text-xs border border-transparent \\\\\\$\\{[\\\\s\\\\S]*?\\\\}\\`\\}\\>\`, 'g');
  
  code = code.replace(btnRegex, \`<button 
            onClick={() => { setInfoSection('\${section}'); sound.playClick(); }}
            className={\\\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-wide uppercase text-xs border border-transparent \\\${
              infoSection === '\${section}' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\\\`}>\`);
}

// And fix the "Home" button
const homeBtnRegex = new RegExp(\`<button\\\\s+onClick=\\{\\(\\) => \\{ setInfoSection\\(null\\); sound\\.playClick\\(\\); \\}\\}\\\\s+className=\\{\\\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-wide uppercase text-xs border border-transparent \\\\\\$\\{[\\\\s\\\\S]*?\\\\}\\`\\}\\>\`, 'g');

// Note there's another button matching `setInfoSection(null)` for the mobile nav, so I should only match the desktop one.
const desktopHomeBtnRegex = /<button \n            onClick=\{\(\) => \{ setInfoSection\(null\); sound\.playClick\(\); \}\}\n            className=\{\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-wide uppercase text-xs border border-transparent \$\{[\s\S]*?\}\`\}/;

code = code.replace(desktopHomeBtnRegex, `<button 
            onClick={() => { setInfoSection(null); sound.playClick(); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-wide uppercase text-xs border border-transparent \${
              !infoSection 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }\`}`);

fs.writeFileSync('src/App.tsx', code);
