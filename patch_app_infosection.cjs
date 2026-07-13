const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<InfoSection\n          section=\{infoSection as any\}\n          onClose=\{\(\) => \{ setInfoSection\(null\); sound\.playClick\(\); \}\}\n        \/>/,
  `<InfoSection
          section={infoSection as any}
          onClose={() => { setInfoSection(null); sound.playClick(); }}
          currentUser={user}
        />`
);

fs.writeFileSync('src/App.tsx', code);
