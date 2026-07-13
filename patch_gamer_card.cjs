const fs = require('fs');
let code = fs.readFileSync('src/components/GamerCard.tsx', 'utf-8');

// GamerPanel modifications
const oldGamerPanelRegex = /export const GamerPanel: React\.FC<GamerPanelProps> = \([\s\S]*?className = ''\n}\) => \{[\s\S]*?return \([\s\S]*?<\/div>\n  \);\n\};/;
const newGamerPanel = `export const GamerPanel: React.FC<GamerPanelProps> = ({
  id,
  title,
  subtitle,
  children,
  variant = 'blue',
  className = ''
}) => {
  const borderClass = 
    variant === 'blue' ? 'border-neon-cyan/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]' :
    variant === 'gold' ? 'border-gold-cabal/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]' :
    'border-white/10 shadow-black/60';
    
  const glowClass = 
    variant === 'blue' ? 'shadow-[inset_0_0_20px_rgba(0,229,255,0.05),0_0_15px_rgba(0,229,255,0.1)]' :
    variant === 'gold' ? 'shadow-[inset_0_0_20px_rgba(212,175,55,0.05),0_0_15px_rgba(212,175,55,0.1)]' :
    'shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]';

  const headerBg = 
    variant === 'blue' ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent border-b border-neon-cyan/30' :
    variant === 'gold' ? 'bg-gradient-to-r from-gold-cabal/20 to-transparent border-b border-gold-cabal/30' :
    'bg-white/5 border-b border-white/10';

  return (
    <div
      id={id}
      className={\`glass-panel rounded-sm relative overflow-hidden transition-all duration-300 \${borderClass} \${glowClass} \${className}\`}
    >
      {/* Tech accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>

      {(title || subtitle) && (
        <div className={\`px-6 py-3 flex flex-col gap-0.5 \${headerBg} backdrop-blur-md\`}>
          {title && (
            <h3 className={\`font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2 \${
              variant === 'blue' ? 'text-neon-cyan text-glow-cyan' : variant === 'gold' ? 'text-gold-cabal text-glow-gold' : 'text-neutral-100'
            }\`}>
              {variant === 'gold' && <span className="text-gold-cabal opacity-80">⟡</span>}
              {variant === 'blue' && <span className="text-neon-cyan opacity-80">❖</span>}
              {title}
            </h3>
          )}
          {subtitle && <p className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">{subtitle}</p>}
        </div>
      )}
      <div className="p-6 relative z-10">
        {children}
      </div>
    </div>
  );
};`;
code = code.replace(oldGamerPanelRegex, newGamerPanel);

// GamerButton modifications
const oldGamerButtonRegex = /export const GamerButton: React\.FC<GamerButtonProps> = \([\s\S]*?className = '',[\s\S]*?type = 'button',[\s\S]*?disabled = false\n\}\) => \{[\s\S]*?return \([\s\S]*?<\/button>\n  \);\n\};/;
const newGamerButton = `export const GamerButton: React.FC<GamerButtonProps> = ({
  id,
  children,
  onClick,
  variant = 'blue',
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyle = "relative font-display font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-sm border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none overflow-hidden group";
  
  const variantStyles = {
    blue: "bg-gradient-to-b from-[#0a1526] to-[#040812] border-neon-cyan/50 text-neon-cyan hover:text-white shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:border-neon-cyan",
    gold: "bg-gradient-to-b from-[#261c0a] to-[#120a04] border-gold-cabal/50 text-gold-cabal hover:text-white shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:border-gold-cabal",
    danger: "bg-gradient-to-b from-[#260a0a] to-[#120404] border-red-500/50 text-red-400 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:border-red-500",
    ghost: "bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/30",
    dark: "bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-white/20 text-gray-300 hover:text-white hover:border-white/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
  };

  const glowColor = 
    variant === 'blue' ? 'bg-neon-cyan' :
    variant === 'gold' ? 'bg-gold-cabal' :
    variant === 'danger' ? 'bg-red-500' :
    'bg-white';

  const handleMouseEnter = () => {
    if (!disabled) {
      sound.playHover();
    }
  };

  const handleCLick = () => {
    if (!disabled) {
      sound.playClick();
      if (onClick) onClick();
    }
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onClick={handleCLick}
      className={\`\${baseStyle} \${variantStyles[variant]} \${className}\`}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
      {/* Bottom glow line */}
      <div className={\`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] \${glowColor} opacity-0 group-hover:w-3/4 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_currentColor]\`}></div>
      <span className="relative z-10 flex items-center gap-2 group-active:scale-95 transition-transform">{children}</span>
    </button>
  );
};`;
code = code.replace(oldGamerButtonRegex, newGamerButton);

// Add shimmer animation to index.css
const shimmerCss = `
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
`;
fs.appendFileSync('src/index.css', shimmerCss);

// GamerBadge modifications
const oldGamerBadgeRegex = /export const GamerBadge: React\.FC<GamerBadgeProps> = \([\s\S]*?className = ''\n\}\) => \{[\s\S]*?return \([\s\S]*?<\/span>\n  \);\n\};/;
const newGamerBadge = `export const GamerBadge: React.FC<GamerBadgeProps> = ({
  children,
  variant = 'blue',
  className = ''
}) => {
  const styles = {
    blue: 'bg-[#0a1526]/80 border-neon-cyan/40 text-neon-cyan shadow-[0_0_10px_rgba(0,229,255,0.2)]',
    gold: 'bg-[#261c0a]/80 border-gold-cabal/40 text-gold-cabal shadow-[0_0_10px_rgba(212,175,55,0.2)]',
    neutral: 'bg-white/5 border-white/20 text-gray-300',
    success: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    danger: 'bg-red-950/80 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
  };

  return (
    <span className={\`px-2.5 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-widest font-bold backdrop-blur-md flex items-center justify-center \${styles[variant]} \${className}\`}>
      {children}
    </span>
  );
};`;
code = code.replace(oldGamerBadgeRegex, newGamerBadge);

fs.writeFileSync('src/components/GamerCard.tsx', code);
