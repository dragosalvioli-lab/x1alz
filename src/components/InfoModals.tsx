/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, Swords, Sparkles, BookOpen, User, HelpCircle, Trophy, List, Mail, HeartHandshake } from 'lucide-react';
import { db, formatALZ, formatBrasiliaDateTime } from '../utils/database';
import { GamerButton, GamerPanel, GamerBadge } from './GamerCard';

interface InfoSectionProps {
  section: 'about' | 'rules' | 'how_to' | 'ranking' | 'history' | 'support';
  onClose: () => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ section, onClose }) => {
  const [rankings, setRankings] = useState(db.getRankings());
  const [allFinishedRooms, setAllFinishedRooms] = useState(
    db.getRooms().filter(r => r.status === 'finished')
  );

  useEffect(() => {
    // Refresh lists
    setRankings(db.getRankings());
    setAllFinishedRooms(db.getRooms().filter(r => r.status === 'finished'));
  }, [section]);

  const getSectionTitle = () => {
    switch (section) {
      case 'about': return 'Sobre o X1 ALZ';
      case 'rules': return 'Regras Oficiais';
      case 'how_to': return 'Como Funciona?';
      case 'ranking': return 'Ranking Geral de Gladiadores';
      case 'history': return 'Histórico de Apostas';
      case 'support': return 'Suporte ao Guerreiro';
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-left">
      <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 shadow-2xl relative">
        <GamerPanel
          variant="blue"
          title={getSectionTitle()}
          subtitle="Arena PvP Cabal Neo"
          className="relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* SECTION CONTENT CONTENT */}
          <div className="mt-2 space-y-6">

            {/* SOBRE (ABOUT) */}
            {section === 'about' && (
              <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <Swords className="w-12 h-12 text-cyan-400" />
                  </div>
                </div>
                <p>
                  O <strong className="text-cyan-400">X1 ALZ</strong> foi idealizado para ser a maior e mais respeitada plataforma de facilitação de apostas PvP (Gladiador contra Gladiador) para jogadores do renomado MMORPG <strong className="text-neutral-100">Cabal Neo</strong>.
                </p>
                <p>
                  Nós compreendemos que o calor da disputa e o desejo de provar a supremacia de classe são pilares do jogo. Por isso, oferecemos um ambiente virtual blindado, neutro e transparente onde os duelistas podem registrar seus palpites, depositar seus ALZ com segurança nas mãos do administrador, e concorrer a pote líquido de forma justa.
                </p>
                <p className="text-xs text-neutral-500">
                  Aviso de Isenção: Este portal é um sistema de entretenimento independente desenvolvido por fãs do jogo e não possui nenhuma afiliação direta, comercial, ou contratual com a EST Games, PlayThisGame ou distribuidoras do Cabal Neo.
                </p>
              </div>
            )}

            {/* COMO FUNCIONA (HOW TO) */}
            {section === 'how_to' && (
              <div className="space-y-4 text-neutral-300 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded bg-cyan-900/40 text-cyan-400 font-mono flex items-center justify-center font-bold text-sm">1</div>
                    <h4 className="font-display font-bold text-neutral-200 text-xs uppercase">REGISTRO DA SALA</h4>
                    <p className="text-neutral-400 text-xxs leading-normal">Defina a aposta (ex: 1b ALZ), gere o código e compartilhe com seu adversário do Cabal.</p>
                  </div>

                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded bg-amber-900/40 text-amber-400 font-mono flex items-center justify-center font-bold text-sm">2</div>
                    <h4 className="font-display font-bold text-neutral-200 text-xs uppercase">DEPÓSITO SEGURO</h4>
                    <p className="text-neutral-400 text-xxs leading-normal">Ambos os jogadores enviam os ALZ para o personagem do admin <strong className="text-amber-400 font-mono">X1Alz</strong> in-game.</p>
                  </div>

                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded bg-emerald-900/40 text-emerald-400 font-mono flex items-center justify-center font-bold text-sm">3</div>
                    <h4 className="font-display font-bold text-neutral-200 text-xs uppercase">SORTEIO & RESGATE</h4>
                    <p className="text-neutral-400 text-xxs leading-normal">O sorteio é feito ao vivo na roleta de probabilidade e o admin faz o trade dos ALZ para o vencedor.</p>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-1.5 mt-2">
                  <h5 className="font-display font-bold text-cyan-400 text-xs uppercase">Por que a taxa administrativa de 5%?</h5>
                  <p className="text-neutral-400 text-xxs leading-relaxed">
                    A taxa cobrada pela plataforma (5% descontada do montante bruto total) serve para financiar os custos de hospedagem do portal, remunerar o tempo de plantão dos administradores responsáveis por liberar as partidas in-game, e financiar eventos promocionais de guilda.
                  </p>
                </div>
              </div>
            )}

            {/* REGRAS (RULES) */}
            {section === 'rules' && (
              <div className="space-y-4 text-neutral-300 text-xs leading-relaxed font-sans">
                <p className="text-sm font-semibold text-cyan-400 font-display uppercase tracking-wider mb-2">✦ REGRAS IMPORTANTES PARA TODOS OS DESAFIANTES</p>
                
                <div className="space-y-3.5 divide-y divide-neutral-900">
                  <div className="pt-2">
                    <span className="font-bold text-neutral-200 block mb-1">1. ENVIO DO ALZ PARA O PERSONAGEM CORRETO</span>
                    <span>O envio de ALZ deve ser feito exclusivamente para o nick configurado como receptor oficial (padrão: <strong className="text-amber-400 font-mono">X1Alz</strong>). Qualquer ALZ enviado por engano para outro jogador ou nome incorreto não é de responsabilidade do X1 ALZ.</span>
                  </div>

                  <div className="pt-3">
                    <span className="font-bold text-neutral-200 block mb-1">2. CANCELAMENTOS DE SALAS</span>
                    <span>Enquanto o adversário não entrar ou se o administrador ainda não tiver confirmado o recebimento de ALZ de ambos, a sala pode ser cancelada a qualquer momento. Seus valores serão marcados para devolução in-game integralmente.</span>
                  </div>

                  <div className="pt-3">
                    <span className="font-bold text-neutral-200 block mb-1">3. RESULTADO SOBERANO</span>
                    <span>O sorteio é executado através do algoritmo computacional imparcial <span className="text-cyan-400 font-mono font-bold">Math.random()</span> no navegador, conferindo 50.00% exatos de probabilidade para cada lado do duelo. Os resultados são definitivos e não cabe recurso.</span>
                  </div>

                  <div className="pt-3">
                    <span className="font-bold text-neutral-200 block mb-1">4. PRAZO DE PAGAMENTO DO PRÊMIO</span>
                    <span>O administrador se compromete a realizar o trade de pagamento de ALZ para o vencedor dentro do jogo em no máximo <strong className="text-neutral-100">12 horas</strong> após o término do sorteio, respeitando o horário de funcionamento das 12:00 às 18:00.</span>
                  </div>
                </div>
              </div>
            )}

            {/* RANKING */}
            {section === 'ranking' && (
              <div className="space-y-4">
                {rankings.length === 0 ? (
                  <p className="text-neutral-500 text-xs py-4 text-center">Nenhum guerreiro registrado no ranking ainda.</p>
                ) : (
                  <div className="overflow-x-auto bg-neutral-950 rounded-xl border border-neutral-800 p-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                          <th className="py-2.5 font-bold text-center w-12">POS</th>
                          <th className="py-2.5 font-bold">GUERREIRO (NICK)</th>
                          <th className="py-2.5 font-bold text-center">W / L</th>
                          <th className="py-2.5 font-bold text-right">TOTAL APOSTADO</th>
                          <th className="py-2.5 font-bold text-right text-emerald-400">LUCRO LÍQUIDO</th>
                          <th className="py-2.5 font-bold text-center text-amber-400">STREAK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {rankings.map((r, idx) => {
                          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
                          return (
                            <tr key={r.userId} className="hover:bg-neutral-900/30">
                              <td className="py-3 font-mono font-bold text-center text-neutral-300">{medal}</td>
                              <td className="py-3">
                                <span className="font-mono font-bold text-neutral-200 uppercase">{r.gameNick}</span>
                                <span className="text-[10px] text-neutral-500 block">Real: {r.name}</span>
                              </td>
                              <td className="py-3 font-mono text-center text-neutral-400">
                                <span className="text-emerald-400">{r.wins}</span> / <span className="text-red-400">{r.losses}</span>
                              </td>
                              <td className="py-3 font-mono text-right text-neutral-400">{formatALZ(r.totalBet)}</td>
                              <td className={`py-3 font-mono text-right font-bold ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {r.profit >= 0 ? '+' : ''}{formatALZ(r.profit)}
                              </td>
                              <td className="py-3 font-mono text-center font-bold text-amber-400">🔥 {r.streak}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* HISTÓRICO GERAL (GLOBAL HISTORY) */}
            {section === 'history' && (
              <div className="space-y-4">
                {allFinishedRooms.length === 0 ? (
                  <p className="text-neutral-500 text-xs py-4 text-center">Nenhum combate concluído registrado no histórico global ainda.</p>
                ) : (
                  <div className="overflow-x-auto bg-neutral-950 rounded-xl border border-neutral-800 p-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                          <th className="py-2.5 font-bold">SALA</th>
                          <th className="py-2.5 font-bold">CRIADOR</th>
                          <th className="py-2.5 font-bold">DESAFIANTE</th>
                          <th className="py-2.5 font-bold">VALOR INDIV.</th>
                          <th className="py-2.5 font-bold text-amber-400">GANHADOR</th>
                          <th className="py-2.5 font-bold">POTE LÍQUIDO</th>
                          <th className="py-2.5 font-bold text-right">FECHAMENTO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {allFinishedRooms.map((room) => (
                          <tr key={room.id} className="hover:bg-neutral-900/30 font-sans">
                            <td className="py-3 font-mono font-bold text-neutral-300 uppercase">{room.code}</td>
                            <td className="py-3 font-mono text-neutral-400">{room.player1Nick}</td>
                            <td className="py-3 font-mono text-neutral-400">{room.player2Nick || 'Bot'}</td>
                            <td className="py-3 font-mono text-neutral-400">{formatALZ(room.betAmount)}</td>
                            <td className="py-3 font-mono font-bold text-amber-400 uppercase">{room.winnerNick}</td>
                            <td className="py-3 font-mono font-bold text-emerald-400">{formatALZ(room.netWinnerAmount)}</td>
                            <td className="py-3 text-right text-neutral-500 font-mono text-[10px]">
                              {room.drawnAt ? formatBrasiliaDateTime(room.drawnAt) : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUPORTE (SUPPORT) */}
            {section === 'support' && (
              <div className="space-y-4 text-neutral-300 text-sm">
                <div className="flex justify-center mb-2">
                  <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <HeartHandshake className="w-12 h-12 text-amber-400 animate-pulse" />
                  </div>
                </div>
                
                <p className="text-center">
                  Precisa de assistência técnica, tirar dúvidas sobre o trade de ALZ ou reportar algum problema? Nossa central de suporte está de prontidão.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1.5 text-left">
                    <h4 className="font-display font-bold text-cyan-400 text-xs uppercase">E-mail de Suporte</h4>
                    <p className="text-neutral-400 text-xxs font-mono">suporte@x1alz.com</p>
                    <p className="text-neutral-500 text-xxs leading-normal">Respondemos solicitações em até 4 horas úteis dentro do período ativo.</p>
                  </div>

                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1.5 text-left">
                    <h4 className="font-display font-bold text-amber-400 text-xs uppercase">Chat Guilda / Discord</h4>
                    <p className="text-neutral-400 text-xxs font-mono">discord.gg/x1alz-cabal</p>
                    <p className="text-neutral-500 text-xxs leading-normal">Comunidade ativa com chat exclusivo para agendamento de trades e apostas altas.</p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 text-xxs text-left flex items-start gap-2 mt-4">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Lembre-se: O administrador oficial <strong className="text-neutral-200">X1AlzAdmin</strong> nunca pedirá sua senha pessoal da plataforma ou suas credenciais de login do jogo Cabal Neo em nenhum canal de comunicação. Proteja sua conta.
                  </span>
                </div>
              </div>
            )}

          </div>

          <div className="mt-8 flex justify-end">
            <GamerButton onClick={onClose} variant="blue" className="px-6">
              Fechar Janela
            </GamerButton>
          </div>

        </GamerPanel>
      </div>
    </div>
  );
};
