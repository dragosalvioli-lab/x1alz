const fs = require('fs');
let code = fs.readFileSync('src/components/InfoModals.tsx', 'utf-8');

code = code.replace(
  /interface InfoSectionProps \{/,
  "interface InfoSectionProps {\n  currentUser?: import('../types').User | null;"
);

code = code.replace(
  /export const InfoSection: React.FC<InfoSectionProps> = \(\{ section, onClose \}\) => \{/,
  "import { SupportTickets } from './SupportTickets';\nexport const InfoSection: React.FC<InfoSectionProps> = ({ section, onClose, currentUser }) => {"
);

code = code.replace(
  /\{section === 'support' && \([\s\S]*?Lembre-se.*?<\/div>\n              <\/div>\n            \)\}/,
  `{section === 'support' && (
              <SupportTickets currentUser={currentUser} />
            )}`
);

fs.writeFileSync('src/components/InfoModals.tsx', code);
