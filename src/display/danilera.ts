import pc from 'picocolors';
import type { MemberScore } from '../types';

const DANILO_LOGIN = 'danilofuchs';

const NOT_IN_TEAM = [
  'o Danilo não trabalha com você kkkkk',
  'o Danilera tá em outro time, deixa ele quieto',
  'esse time não tem Danilo... sortudo',
  'procurei o Danilofuchs aqui e não achei, ele agradece',
];

const AHEAD_MSGS = [
  (n: number) => `você está ${pc.bold(pc.green(`+${n}`))} reviews à frente do Danilera — respeito`,
  (n: number) => `+${n} no Danilofuchs. Aproveita que isso não dura kkkk`,
  (n: number) => `${n} reviews de vantagem pro Danilera. Hoje é seu dia`,
];

const BEHIND_MSGS = [
  (n: number) => `você está ${pc.bold(pc.red(`-${n}`))} reviews atrás do Danilera — tá dormindo?`,
  (n: number) => `o Danilofuchs tá ${n} reviews na sua frente. Ele nem tá olhando`,
  (n: number) => `${n} reviews atrás do Danilera. Ele revisou mais e ainda tomou café`,
];

const TIED_MSGS = [
  'empatado com o Danilera — ele já virou pro próximo PR',
  'você empatou com o Danilofuchs. Sorte que ele não sabe disso',
  'empate técnico com o Danilo. Por enquanto.',
];

const YOU_ARE_DANILO = [
  'você É o Danilera. Faz sentido.',
  'oi Danilo kkkk',
  'o próprio Danilofuchs usando o pr-score. Clássico.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function renderDanilera(scores: MemberScore[], me?: string): void {
  const danilo = scores.find((s) => s.login === DANILO_LOGIN);

  console.log('');

  if (!danilo) {
    console.log(`  ${pc.yellow('danilera')}  ${pick(NOT_IN_TEAM)}`);
    console.log('');
    return;
  }

  if (me === DANILO_LOGIN) {
    console.log(`  ${pc.yellow('danilera')}  ${pick(YOU_ARE_DANILO)}`);
    console.log('');
    return;
  }

  const myScore = me ? scores.find((s) => s.login === me) : null;

  if (!myScore) {
    const rank = scores.findIndex((s) => s.login === DANILO_LOGIN) + 1;
    console.log(
      `  ${pc.yellow('danilera')}  danilofuchs está em #${rank} com ${danilo.reviews} reviews`
    );
    console.log(`              rode com ${pc.dim('--me <login>')} pra ver sua distância`);
    console.log('');
    return;
  }

  const diff = myScore.reviews - danilo.reviews;

  if (diff > 0) {
    const msg = pick(AHEAD_MSGS)(diff);
    console.log(`  ${pc.yellow('danilera')}  ${msg}`);
  } else if (diff < 0) {
    const msg = pick(BEHIND_MSGS)(Math.abs(diff));
    console.log(`  ${pc.yellow('danilera')}  ${msg}`);
  } else {
    console.log(`  ${pc.yellow('danilera')}  ${pick(TIED_MSGS)}`);
  }

  console.log('');
}
