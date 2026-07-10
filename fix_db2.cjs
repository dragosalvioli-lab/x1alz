const fs = require('fs');
let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

code = code.replace(/  private saveSettings\(\) \{ setDoc\(doc\(firestore, 'settings', 'global'\), this\.settings\)\.catch\(\(\)=>\{\}\); \}[\s\S]*?resetAllData\(\) \{/, `  private saveSettings() { setDoc(doc(firestore, 'settings', 'global'), this.settings).catch(()=>{}); }
  
  resetAllData() {`);

fs.writeFileSync('src/utils/database.ts', code);
