const fs = require('fs');
let blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf-8'));
blueprint.collections.push({
  collectionId: "tickets",
  fields: [
    { name: "userId", type: "string" },
    { name: "userNick", type: "string" },
    { name: "category", type: "string" },
    { name: "status", type: "string" },
    { name: "messages", type: "array" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" }
  ]
});
fs.writeFileSync('firebase-blueprint.json', JSON.stringify(blueprint, null, 2));
