const fs = require('fs');
let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

code = code.replace(/  private saveSettings\(\) \{ setDoc\(doc\(firestore, 'settings', 'global'\), this\.settings\)\.catch\(\(\)=>\{\}\); \} \n    else \{\n      localStorage\.removeItem\('x1_session'\);\n    \}\n  \}/, `  private saveSettings() { setDoc(doc(firestore, 'settings', 'global'), this.settings).catch(()=>{}); }`);

fs.writeFileSync('src/utils/database.ts', code);
