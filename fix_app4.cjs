const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/const res = db\.login\('admin@x1alz\.com', 'admin123'\);\n      if \(res\.success && res\.user\) \{\n        setUser\(res\.user\);\n      \}/, `const res = await db.login('admin@x1alz.com', 'admin123');
      if (res.success && res.user) {
        setUser(res.user);
      }`);

appCode = appCode.replace(/const res = db\.login\('lucas@gmail\.com', '123456'\);\n      if \(res\.success && res\.user\) \{\n        setUser\(res\.user\);\n      \}/, `const res = await db.login('lucas@gmail.com', '123456');
      if (res.success && res.user) {
        setUser(res.user);
      }`);

appCode = appCode.replace(/const handleSwitchUser = \(\) => \{/, 'const handleSwitchUser = async () => {');

fs.writeFileSync('src/App.tsx', appCode);
