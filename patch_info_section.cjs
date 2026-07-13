const fs = require('fs');
let code = fs.readFileSync('src/components/InfoModals.tsx', 'utf-8');

const targetStart = `{section === 'support' && (`;
const targetRegex = /\{section === 'support' && \([\s\S]*?<\/div>\n            \)\}/;

code = code.replace(targetRegex, `{section === 'support' && (
              <SupportTickets currentUser={currentUser} />
            )}`);

fs.writeFileSync('src/components/InfoModals.tsx', code);
