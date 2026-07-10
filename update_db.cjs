const fs = require('fs');

let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

// 1. Add firebase imports
const firebaseImports = `
import { db as firestore } from '../firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
`;
code = code.replace("import { User, Room", firebaseImports + "import { User, Room");

// 2. Modify X1Database class constructor and fields
const constructorRegex = /constructor\(\) \{[\s\S]*?this\.cleanupSpecificUsers\(\);\s*\}/;
const newConstructor = `
  public onUpdate: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.onUpdate.push(callback);
    return () => {
      this.onUpdate = this.onUpdate.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.onUpdate.forEach(cb => cb());
  }

  constructor() {
    // Session is still local
    const sess = localStorage.getItem('x1_session');
    if (sess) {
      this.activeSession = JSON.parse(sess);
    }
    
    // Passwords still local for this mock
    const pw = localStorage.getItem('x1_passwords');
    if (pw) {
      this.userPasswords = JSON.parse(pw);
      this.userPasswords['user_admin_1'] = simulateHash('gsdv159357');
    } else {
      this.userPasswords = { 'user_admin_1': simulateHash('gsdv159357') };
      localStorage.setItem('x1_passwords', JSON.stringify(this.userPasswords));
    }

    this.setupFirebase();
  }

  private setupFirebase() {
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
  }
`;
code = code.replace(constructorRegex, newConstructor);

// Remove loadFromStorage and cleanupSpecificUsers
code = code.replace(/private cleanupSpecificUsers\(\) \{[\s\S]*?\}\s*private loadFromStorage\(\) \{[\s\S]*?\}\s*private saveUsers\(\) \{.*\}\s*private saveRooms\(\) \{.*\}\s*private savePayments\(\) \{.*\}\s*private saveTransactions\(\) \{.*\}\s*private saveLogs\(\) \{.*\}\s*private saveSettings\(\) \{.*\}\s*private savePasswords\(\) \{.*\}\s*private saveSession\(\) \{[\s\S]*?\}/, `
  private saveUsers() {}
  private saveRooms() {}
  private savePayments() {}
  private saveTransactions() {}
  private saveLogs() {}
  private saveSettings() {}
  private savePasswords() { localStorage.setItem('x1_passwords', JSON.stringify(this.userPasswords)); }
  private saveSession() {
    if (this.activeSession) {
      localStorage.setItem('x1_session', JSON.stringify(this.activeSession));
    } else {
      localStorage.removeItem('x1_session');
    }
  }
`);

fs.writeFileSync('src/utils/database.ts', code);
