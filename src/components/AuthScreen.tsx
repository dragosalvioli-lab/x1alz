/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Shield, Sparkles, Swords, Key, HelpCircle } from 'lucide-react';
import { db } from '../utils/database';
import { GamerButton, GamerPanel, GamerBadge } from './GamerCard';

interface AuthScreenProps {
  onSuccess: (user: any) => void;
  onShowSection: (section: 'rules' | 'about' | 'history' | 'ranking') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onShowSection }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form
  const [regNick, setRegNick] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGuild, setRegGuild] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Status message
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail || !loginPassword) {
      setError('Por favor, informe seu email e senha.');
      return;
    }

    const res = await db.login(loginEmail, loginPassword);
    if (res.success) {
      // Don't call onSuccess manually if we are listening to db changes
      // or we can call onSuccess(res.user)
      if (onSuccess && res.user) onSuccess(res.user);
    } else {
      setError(res.error || 'Dados de login incorretos.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regEmail || !regPassword || !regNick || !regGuild) {
      setError('Por favor, preencha todos os campos do cadastro.');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso para cadastrar-se.');
      return;
    }

    const res = await db.register(regEmail, regPassword, regNick, regGuild);
    if (res.success) {
      setSuccessMsg('Conta criada com sucesso! Um email de verificação foi enviado. Por favor, verifique sua caixa de entrada e spam.');
      setIsLogin(true);
      setLoginEmail(regEmail);
      setLoginPassword('');
      
      // Clear register state
      setRegEmail('');
      setRegPassword('');
      setRegNick('');
      setRegGuild('');
      setAcceptTerms(false);
    } else {
      setError(res.error || 'Erro ao efetuar cadastro.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[80vh]">
      
      {/* Brand & Introduction Column */}
      <div className="lg:col-span-7 space-y-6 text-left">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Swords className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-400 to-amber-500 uppercase">
              X1 ALZ
            </h1>
            <p className="text-xxs font-mono text-cyan-400 tracking-widest uppercase">
              Cabal Neo PvP Arena
            </p>
          </div>
        </div>

        <p className="text-neutral-300 text-lg leading-relaxed max-w-xl">
          Desafie outros guerreiros em combates de apostas de ALZ totalmente seguras e auditadas pela casa. Crie salas personalizadas de 100kk a 10b, convide adversários e acompanhe o sorteio ao vivo em tempo real.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-cyan-500/30 transition-colors">
            <h4 className="font-display font-bold text-cyan-400 text-sm mb-1 uppercase">1. Transações Seguras</h4>
            <p className="text-neutral-400 text-xs leading-relaxed">Deposite seus ALZ diretamente no personagem confiável <span className="font-mono text-amber-400 font-bold">X1Alz</span> sob controle total do administrador.</p>
          </div>
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl hover:border-amber-500/30 transition-colors">
            <h4 className="font-display font-bold text-amber-400 text-sm mb-1 uppercase">2. Sorteio ao Vivo</h4>
            <p className="text-neutral-400 text-xs leading-relaxed">O sorteio inicia na hora com uma linda animação de roleta e probabilidade justa baseada em <span className="font-mono text-cyan-400">Math.random()</span>.</p>
          </div>
        </div>

        {/* Informative sections navigation */}
        <div className="pt-4 flex flex-wrap gap-2.5">
          <GamerButton onClick={() => onShowSection('rules')} variant="ghost" className="text-xs">
            Regras de Uso
          </GamerButton>
          <GamerButton onClick={() => onShowSection('about')} variant="ghost" className="text-xs">
            Como Funciona?
          </GamerButton>
          <GamerButton onClick={() => onShowSection('ranking')} variant="ghost" className="text-xs">
            Ver Ranking Geral
          </GamerButton>
          <GamerButton onClick={() => onShowSection('history')} variant="ghost" className="text-xs">
            Ver Histórico
          </GamerButton>
        </div>
      </div>

      {/* Forms Column */}
      <div className="lg:col-span-5">
        <GamerPanel
          variant={isLogin ? 'blue' : 'gold'}
          title={isLogin ? 'Login do Guerreiro' : 'Alistamento na Arena'}
          subtitle={isLogin ? 'Entre com o Nick do seu Personagem' : 'Cadastre seu Personagem e Guilda para apostar'}
          className="relative shadow-xl"
        >
          {error && (
            <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/30 rounded-lg text-red-400 text-xs text-left animate-shake font-sans">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs text-left font-sans">
              ✅ {successMsg}
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative mb-4">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com ou usuário"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                  />
                </div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider">
                    Senha
                  </label>
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (!loginEmail) {
                        setError('Informe seu email ou usuário para recuperar a senha.');
                        return;
                      }
                      const res = await db.recoverPassword(loginEmail);
                      if (res.success) {
                        setSuccessMsg('Email de recuperação enviado! Por favor, verifique sua caixa de entrada e também a CAIXA DE SPAM.');
                        setError('');
                      } else {
                        setError(res.error || 'Erro ao recuperar senha.');
                        setSuccessMsg('');
                      }
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                  />
                </div>
              </div>
              <GamerButton type="submit" variant="blue" className="w-full py-3.5 text-sm mt-2">
                <Swords className="w-4 h-4" /> Entrar na Arena
              </GamerButton>
              <p className="text-center text-xs text-neutral-500 mt-4">
                Não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </p>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative mb-4">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative mb-4">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Nome do Personagem (Nick)
                </label>
                <div className="relative mb-4">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={regNick}
                    onChange={(e) => setRegNick(e.target.value)}
                    placeholder="Ex: GuerreiroPVP"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Guilda do Personagem
                </label>
                <div className="relative mb-4">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={regGuild}
                    onChange={(e) => setRegGuild(e.target.value)}
                    placeholder="Ex: OsGuerreiros"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-800 text-amber-500 focus:ring-amber-500 bg-neutral-950"
                />
                <label htmlFor="terms" className="text-xxs text-neutral-400 leading-normal select-none">
                  Eu concordo com as regras de apostas, retenção de taxa administrativa de 3%, e me comprometo a enviar os ALZ para o personagem correspondente.
                </label>
              </div>
              <GamerButton type="submit" variant="gold" className="w-full py-3 text-xs mt-2">
                Criar Minha Arena
              </GamerButton>
              <p className="text-center text-xs text-neutral-500 mt-3">
                Já é cadastrado?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Acesse sua conta
                </button>
              </p>
            </form>
          )}
        </GamerPanel>
      </div>
    </div>
  );
};
