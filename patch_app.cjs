const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /useState\<'about' \| 'rules' \| 'how_to' \| 'ranking' \| 'history' \| 'support' \| null\>/,
  "useState<'about' | 'rules' | 'how_to' | 'ranking' | 'history' | 'support' | 'chat' | null>"
);

fs.writeFileSync('src/App.tsx', code);
