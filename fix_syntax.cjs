const fs = require('fs');
let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

code = code.replace(/  \} else \{\n      localStorage.removeItem\('x1_session'\);\n    \}/g, '');
code = code.replace(/  private saveSession\(\) \{\n    if \(this.activeSession\) \{\n      localStorage.setItem\('x1_session', JSON.stringify\(this.activeSession\)\);\n    \}\n/, `  private saveSession() {\n    if (this.activeSession) {\n      localStorage.setItem('x1_session', JSON.stringify(this.activeSession));\n    } else {\n      localStorage.removeItem('x1_session');\n    }\n`);

fs.writeFileSync('src/utils/database.ts', code);
