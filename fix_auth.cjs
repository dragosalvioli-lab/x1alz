const fs = require('fs');

let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

if (!code.includes('import { auth }')) {
    code = code.replace("import { db as firestore } from '../firebase';", "import { db as firestore, auth } from '../firebase';\nimport { signInAnonymously } from 'firebase/auth';");
}

const setupRegex = /private setupFirebase\(\) \{([\s\S]*?)private saveUsers\(\)/;
const newSetup = `private setupFirebase() {
    signInAnonymously(auth).then(() => {
      onSnapshot(collection(firestore, 'users'), (snap) => {
        this.users = snap.docs.map(d => d.data() as User);
        this.notify();
      });
      onSnapshot(collection(firestore, 'rooms'), (snap) => {
        this.rooms = snap.docs.map(d => d.data() as Room).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'payments'), (snap) => {
        this.payments = snap.docs.map(d => d.data() as Payment).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'transactions'), (snap) => {
        this.transactions = snap.docs.map(d => d.data() as Transaction).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'logs'), (snap) => {
        this.logs = snap.docs.map(d => d.data() as AdminLog).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'settings'), (snap) => {
        if (!snap.empty) {
          this.settings = snap.docs[0].data() as AppSettings;
        }
        this.notify();
      });
    }).catch(err => console.error("Auth failed:", err));
  }

  private saveUsers()`;

code = code.replace(setupRegex, newSetup);

fs.writeFileSync('src/utils/database.ts', code);
