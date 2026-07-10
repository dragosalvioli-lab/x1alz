const fs = require('fs');

let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

function addSetDoc(methodName, itemVar, collectionName) {
    const regex = new RegExp(`this\\.${methodName}\\(\\)`);
    // wait, we can't do this easily.
}

// Let's replace the whole X1Database methods using AST or simple replace.
// Actually, I can just replace the specific methods.

