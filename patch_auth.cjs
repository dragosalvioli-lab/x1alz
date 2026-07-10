const fs = require('fs');

let dbCode = fs.readFileSync('src/utils/database.ts', 'utf-8');

// 1. imports
if (!dbCode.includes('createUserWithEmailAndPassword')) {
    dbCode = dbCode.replace("import { signInAnonymously } from 'firebase/auth';", "import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from 'firebase/auth';\nimport { getDoc } from 'firebase/firestore';");
}

// 2. setupFirebase
dbCode = dbCode.replace(/signInAnonymously\(auth\)\.then\(\(\) => \{/, `onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified && firebaseUser.email !== 'admin@x1alz.com') {
          this.activeSession = null;
        } else {
          try {
            const uDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
            if (uDoc.exists()) {
              this.activeSession = uDoc.data() as User;
            }
          } catch(e){}
        }
      } else {
        this.activeSession = null;
      }
      this.notify();
    });

    try {`);
dbCode = dbCode.replace(/\}\)\.catch\(err => console\.error\("Auth failed:", err\)\);/, `} catch(err) { console.error("Auth failed:", err); }`);

// Remove old active session logic in constructor
dbCode = dbCode.replace(/const sess = localStorage\.getItem\('x1_session'\);[\s\S]*?this\.setupFirebase\(\);/, `this.setupFirebase();`);

// Remove saveSession and passwords
dbCode = dbCode.replace(/private savePasswords\(\) \{[\s\S]*?\}\n/, '');
dbCode = dbCode.replace(/private saveSession\(\) \{[\s\S]*?\}\n/, '');
dbCode = dbCode.replace(/private userPasswords: Record<string, string> = \{\};\n/, '');

// Rewrite register
dbCode = dbCode.replace(/register\(gameNick: string, guild: string\): \{ success: boolean; error\?: string; user\?: User \} \{[\s\S]*?this\.savePasswords\(\);\n/, `async register(email: string, password: string, gameNick: string, guild: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const cleanNick = gameNick.trim();
    const cleanGuild = guild.trim();

    if (this.users.some(u => u.gameNick.toLowerCase() === cleanNick.toLowerCase())) {
      return { success: false, error: 'Nick do jogo já cadastrado.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      const newUser: User = {
        id: userCredential.user.uid,
        name: cleanNick,
        gameNick: cleanNick,
        email: email.toLowerCase(),
        guild: cleanGuild,
        role: 'player',
        wins: 0,
        losses: 0,
        totalBet: 0,
        profit: 0,
        streak: 0,
        maxStreak: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, 'users', newUser.id), newUser);
      await signOut(auth); // Sign out so they can't access until verified
      
      return { success: true, user: newUser };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  //`);

// Rewrite login
dbCode = dbCode.replace(/login\(gameNick: string, adminPassword\?: string\): \{ success: boolean; error\?: string; user\?: User \} \{[\s\S]*?return \{ success: false, error: 'Nick não encontrado\.' \};\n    \}\n  \}/, `async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
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
  }`);

// Rewrite logout
dbCode = dbCode.replace(/logout\(\) \{\n    this\.activeSession = null;\n    this\.saveSession\(\);\n    this\.notify\(\);\n  \}/, `async logout() {\n    await signOut(auth);\n    this.activeSession = null;\n    this.notify();\n  }`);


fs.writeFileSync('src/utils/database.ts', dbCode);
