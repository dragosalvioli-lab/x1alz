const fs = require('fs');
let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

code = code.replace(/return \{ success: false, error: "Credenciais inválidas ou erro no login\." \};\n    \}\n  \}\n\n  async logout\(\)/, `if (e.code === 'auth/invalid-credential') {
        return { success: false, error: 'Email ou senha incorretos.' };
      }
      return { success: false, error: "Credenciais inválidas ou erro no login." };
    }
  }

  async logout()`);
fs.writeFileSync('src/utils/database.ts', code);
