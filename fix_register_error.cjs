const fs = require('fs');
let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

code = code.replace(/return \{ success: false, error: e\.message \};\n    \}\n  \}\n\n  \/\/ Login/, `if (e.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Este email já está em uso.' };
      } else if (e.code === 'auth/weak-password') {
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
      }
      return { success: false, error: e.message };
    }
  }
  
  // Login`);
fs.writeFileSync('src/utils/database.ts', code);
