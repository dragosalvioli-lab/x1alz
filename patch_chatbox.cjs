const fs = require('fs');
let code = fs.readFileSync('src/components/ChatBox.tsx', 'utf-8');

code = code.replace(/if \(currentUser\.role === 'admin'\)/g, "if (currentUser?.role === 'admin')");
code = code.replace(/setPrivateMsgs\(db\.getPrivateMessages\(currentUser\.id\)\);/g, "if (currentUser) setPrivateMsgs(db.getPrivateMessages(currentUser.id)); else setPrivateMsgs([]);");
code = code.replace(/await db\.sendChatMessage\(currentUser\.id/g, "if (!currentUser) return; await db.sendChatMessage(currentUser.id");
code = code.replace(/if \(currentUser\.role !== 'admin'\)/g, "if (currentUser?.role !== 'admin')");
code = code.replace(/m\.senderId === currentUser\.id/g, "m.senderId === currentUser?.id");
code = code.replace(/otherId !== currentUser\.id/g, "otherId !== currentUser?.id");
code = code.replace(/\{currentUser\.role === 'admin' \?/g, "{currentUser?.role === 'admin' ?");
code = code.replace(/currentUser\.role !== 'admin'/g, "currentUser?.role !== 'admin'");

fs.writeFileSync('src/components/ChatBox.tsx', code);
