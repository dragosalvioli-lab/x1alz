const fs = require('fs');
let code = fs.readFileSync('src/components/ChatBox.tsx', 'utf-8');

code = code.replace(
  /interface ChatBoxProps \{\n  currentUser: User \| null;\n\}/,
  `interface ChatBoxProps {\n  currentUser: User | null;\n  inline?: boolean;\n}`
);

code = code.replace(
  /export const ChatBox: React\.FC\<ChatBoxProps\> = \(\{ currentUser \}\) =\> \{/,
  `export const ChatBox: React.FC<ChatBoxProps> = ({ currentUser, inline = false }) => {`
);

const ifIsOpenString = `if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }`;

const replacementIfIsOpen = `if (!isOpen && !inline) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }`;

code = code.replace(ifIsOpenString, replacementIfIsOpen);

const returnString = `return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] sm:w-[380px] h-[450px] bg-[#0A0A0A] border border-neutral-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in">`;

const returnStringReplacement = `return (
    <div className={inline ? "w-full h-full min-h-[500px] bg-[#0A0A0A] border border-neutral-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in" : "fixed bottom-6 right-6 z-50 w-[320px] sm:w-[380px] h-[450px] bg-[#0A0A0A] border border-neutral-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in"}>`;

code = code.replace(returnString, returnStringReplacement);

const closeBtnString = `<button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>`;
        
const closeBtnReplacement = `{!inline && (
        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        )}`;
code = code.replace(closeBtnString, closeBtnReplacement);

fs.writeFileSync('src/components/ChatBox.tsx', code);
