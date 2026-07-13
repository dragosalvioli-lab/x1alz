const fs = require('fs');
const css = `
@import "tailwindcss";

@theme {
  --color-neon-cyan: #00E5FF;
  --color-gold-cabal: #D4AF37;
  --color-neon-purple: #9d4edd;
  --color-dark-bg: #030508;
  --color-dark-panel: #070b12;
  --color-dark-card: #0a0f18;
  --color-win-neon: #39ff14;
  --color-loss-red: #ff3333;
  
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --font-display: "Space Grotesk", sans-serif;
}

@layer base {
  body {
    background-color: var(--color-dark-bg);
    color: #e2e8f0;
    font-family: var(--font-sans);
    background-image: 
      radial-gradient(circle at 15% 50%, rgba(0, 229, 255, 0.03), transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(212, 175, 55, 0.03), transparent 25%);
    background-attachment: fixed;
  }
  
  /* Add subtle texture to the body */
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #030508;
}
::-webkit-scrollbar-thumb {
  background: #1a2233;
  border-radius: 0px;
  border: 1px solid #2a354d;
}
::-webkit-scrollbar-thumb:hover {
  background: #2a354d;
  box-shadow: 0 0 10px rgba(0,229,255,0.2);
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse-glow {
  0% { opacity: 0.6; box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); }
  50% { opacity: 1; box-shadow: 0 0 20px rgba(0, 229, 255, 0.5); }
  100% { opacity: 0.6; box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

/* Glassmorphism Panels */
.glass-panel {
  background: rgba(10, 15, 24, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 4px 30px rgba(0,0,0,0.5);
}

.glass-panel-glow {
  border-top: 1px solid rgba(0, 229, 255, 0.3);
  border-bottom: 1px solid rgba(0, 229, 255, 0.05);
}

/* Glowing text */
.text-glow-cyan {
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3);
}
.text-glow-gold {
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
}

/* Form Inputs */
.mmorpg-input {
  background: rgba(5, 8, 12, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}
.mmorpg-input:focus {
  border-color: var(--color-neon-cyan);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2), inset 0 2px 5px rgba(0,0,0,0.5);
  outline: none;
}

/* Tables */
.mmorpg-table tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255,255,255,0.02);
}
.mmorpg-table tbody tr:hover {
  background: rgba(0, 229, 255, 0.03);
  border-left: 2px solid var(--color-neon-cyan);
}
`;
fs.writeFileSync('src/index.css', css);
