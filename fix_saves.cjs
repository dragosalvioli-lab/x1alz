const fs = require('fs');

let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

code = code.replace(/private saveUsers\(\) \{\}/, `private saveUsers() { this.users.forEach(u => setDoc(doc(firestore, 'users', u.id), u).catch(()=>{})); }`);
code = code.replace(/private saveRooms\(\) \{\}/, `private saveRooms() { this.rooms.forEach(r => setDoc(doc(firestore, 'rooms', r.id), r).catch(()=>{})); }`);
code = code.replace(/private savePayments\(\) \{\}/, `private savePayments() { this.payments.forEach(p => setDoc(doc(firestore, 'payments', p.id), p).catch(()=>{})); }`);
code = code.replace(/private saveTransactions\(\) \{\}/, `private saveTransactions() { this.transactions.forEach(t => setDoc(doc(firestore, 'transactions', t.id), t).catch(()=>{})); }`);
code = code.replace(/private saveLogs\(\) \{\}/, `private saveLogs() { this.logs.forEach(l => setDoc(doc(firestore, 'logs', l.id), l).catch(()=>{})); }`);
code = code.replace(/private saveSettings\(\) \{\}/, `private saveSettings() { setDoc(doc(firestore, 'settings', 'global'), this.settings).catch(()=>{}); }`);

fs.writeFileSync('src/utils/database.ts', code);
