const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldDialogs = `{/* FLOATING OVERLAY DIALOGS */}
      {infoSection && (
        <InfoSection
          section={infoSection}
          onClose={() => { setInfoSection(null); sound.playClick(); }}
        />
      )}`;

const newDialogs = `{/* FLOATING OVERLAY DIALOGS */}
      {infoSection && infoSection !== 'chat' && (
        <InfoSection
          section={infoSection as any}
          onClose={() => { setInfoSection(null); sound.playClick(); }}
        />
      )}`;

code = code.replace(oldDialogs, newDialogs);
fs.writeFileSync('src/App.tsx', code);
