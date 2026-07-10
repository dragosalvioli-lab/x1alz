const fs = require('fs');

// Fix AuthScreen.tsx
let authScreenCode = fs.readFileSync('src/components/AuthScreen.tsx', 'utf-8');
authScreenCode = authScreenCode.replace(/const \[regEmail, setRegEmail\] = useState\(''\);\n  const \[regPassword, setRegPassword\] = useState\(''\);\n  const \[regEmail, setRegEmail\] = useState\(''\);\n  const \[regPassword, setRegPassword\] = useState\(''\);/, "const [regEmail, setRegEmail] = useState('');\n  const [regPassword, setRegPassword] = useState('');");
fs.writeFileSync('src/components/AuthScreen.tsx', authScreenCode);

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/const handleLoginAdmin = \(\) => \{\n      const res = db\.login\('admin@x1alz\.com', 'admin123'\);\n      if \(res\.success\) \{\n        handleRefreshUser\(\);\n      \}\n    \};/, `const handleLoginAdmin = async () => {
      const res = await db.login('admin@x1alz.com', 'admin123');
      if (res.success) {
        handleRefreshUser();
      }
    };`);
appCode = appCode.replace(/const handleLoginMock = \(\) => \{\n      const res = db\.login\('lucas@gmail\.com', '123456'\);\n      if \(res\.success\) \{\n        handleRefreshUser\(\);\n      \}\n    \};/, `const handleLoginMock = async () => {
      const res = await db.login('lucas@gmail.com', '123456');
      if (res.success) {
        handleRefreshUser();
      }
    };`);
fs.writeFileSync('src/App.tsx', appCode);

// Fix database.ts
let dbCode = fs.readFileSync('src/utils/database.ts', 'utf-8');
dbCode = dbCode.replace(/this\.savePasswords\(\);\n    this\.saveSession\(\);/g, "");
dbCode = dbCode.replace(/this\.saveSession\(\);/g, "");
dbCode = dbCode.replace(/this\.userPasswords = \{[\s\S]*?\};\n/, "");
fs.writeFileSync('src/utils/database.ts', dbCode);
