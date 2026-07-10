const fs = require('fs');
let lines = fs.readFileSync('src/utils/database.ts', 'utf-8').split('\n');

const startIndex = lines.findIndex(l => l.includes('// Log action'));
const endIndex = lines.findIndex(l => l.includes('// Update Settings'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex, `  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified && userCredential.user.email !== 'admin@x1alz.com') {
          await signOut(auth);
          return { success: false, error: 'Por favor, verifique seu email (verifique a caixa de spam).' };
      }
      
      const uDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
      if (uDoc.exists()) {
        const uData = uDoc.data() as User;
        this.activeSession = uData;
        this.notify();
        return { success: true, user: uData };
      }
      return { success: false, error: 'Usuário não encontrado no banco de dados.' };
    } catch (e: any) {
      return { success: false, error: "Credenciais inválidas ou erro no login." };
    }
  }

  `);
  
  fs.writeFileSync('src/utils/database.ts', lines.join('\n'));
}
