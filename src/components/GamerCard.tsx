/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../utils/audio';

interface GamerPanelProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'blue' | 'gold' | 'dark';
  className?: string;
}

export const GamerPanel: React.FC<GamerPanelProps> = ({
  id,
  title,
  subtitle,
  children,
  variant = 'blue',
  className = ''
}) => {
  const borderClass = 
    variant === 'blue' ? 'border-neon-cyan/15 hover:border-neon-cyan/30 shadow-neon-cyan/5' :
    variant === 'gold' ? 'border-gold-cabal/15 hover:border-gold-cabal/30 shadow-gold-cabal/5' :
    'border-white/10 hover:border-white/20 shadow-black/40';

  const glowClass = 
    variant === 'blue' ? 'shadow-[0_0_20px_rgba(0,229,255,0.03)]' :
    variant === 'gold' ? 'shadow-[0_0_20px_rgba(212,175,55,0.03)]' :
    '';

  return (
    <div
      id={id}
      className={`bg-gradient-to-b from-[#111111] to-[#080808] border rounded-2xl overflow-hidden transition-all duration-300 ${borderClass} ${glowClass} ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/5 flex flex-col gap-0.5 bg-[#0A0A0A]/50">
          {title && (
            <h3 className={`font-display font-bold uppercase tracking-wider text-xs flex items-center gap-2 ${
              variant === 'blue' ? 'text-neon-cyan' : variant === 'gold' ? 'text-gold-cabal' : 'text-neutral-100'
            }`}>
              {variant === 'gold' && <span className="text-gold-cabal">✦</span>}
              {variant === 'blue' && <span className="text-neon-cyan">⚔</span>}
              {title}
            </h3>
          )}
          {subtitle && <p className="text-[10px] text-gray-400 font-sans tracking-wide">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

interface GamerButtonProps {
  id?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'gold' | 'danger' | 'ghost' | 'dark';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const GamerButton: React.FC<GamerButtonProps> = ({
  id,
  children,
  onClick,
  variant = 'blue',
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyle = "font-display font-bold uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:active:scale-100";
  
  const variantStyles = {
    blue: "bg-neon-cyan/5 border-neon-cyan/30 text-white hover:bg-neon-cyan hover:text-black hover:border-neon-cyan shadow-[0_0_12px_rgba(0,229,255,0.06)] hover:shadow-[0_0_20px_rgba(0,229,255,0.25)]",
    gold: "bg-gold-cabal/5 border-gold-cabal/30 text-white hover:bg-gold-cabal hover:text-black hover:border-gold-cabal shadow-[0_0_12px_rgba(212,175,55,0.06)] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]",
    danger: "bg-red-500/5 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-neutral-950 hover:border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.06)]",
    ghost: "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10",
    dark: "bg-[#0A0A0A] border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20"
  };

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
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

interface GamerBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'gold' | 'neutral' | 'success' | 'danger';
  className?: string;
}

export const GamerBadge: React.FC<GamerBadgeProps> = ({
  children,
  variant = 'blue',
  className = ''
}) => {
  const styles = {
    blue: 'bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan',
    gold: 'bg-gold-cabal/10 border-gold-cabal/20 text-gold-cabal',
    neutral: 'bg-white/5 border-white/10 text-gray-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-widest font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
