const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldMain = `{/* Draw modal overlay gets priority */}
          {activeRoomDraw ? (`;

const newMain = `{/* Draw modal overlay gets priority */}
          {infoSection === 'chat' ? (
            <div className="h-[calc(100vh-200px)] w-full">
              <ChatBox currentUser={user} inline />
            </div>
          ) : activeRoomDraw ? (`;

code = code.replace(oldMain, newMain);
fs.writeFileSync('src/App.tsx', code);
