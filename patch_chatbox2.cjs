const fs = require('fs');
let code = fs.readFileSync('src/components/ChatBox.tsx', 'utf-8');

const replacement = `
      {/* Input Area */}
      {!currentUser ? (
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-center text-xs text-neutral-500 font-mono">
          Faça login para participar do chat.
        </div>
      ) : (
        (activeTab === 'global' || (activeTab === 'private' && (currentUser?.role !== 'admin' || adminSelectedUserId))) && (
          <form onSubmit={handleSend} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-[#0A0A0A] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!text.trim()}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-cyan-400 hover:bg-neutral-800 hover:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )
      )}
`;

code = code.replace(/\{\/\* Input Area \*\/\}[\s\S]*\}\)\}/, replacement.trim());
fs.writeFileSync('src/components/ChatBox.tsx', code);
