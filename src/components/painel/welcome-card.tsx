"use client";

import { motion } from "motion/react";
import { Bloom } from "../backdrop";
import { Ornament } from "../ornament";
import { buttonPrimary } from "../ui";

const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? full;

/** Boas-vindas aos noivos quando recebem o painel, assinadas por Francisco Afonso. */
export function WelcomeCard({
  partnerOneName,
  partnerTwoName,
  onContinue,
}: {
  partnerOneName?: string;
  partnerTwoName?: string;
  onContinue: () => void;
}) {
  const names = partnerOneName && partnerTwoName ? `${firstName(partnerOneName)} e ${firstName(partnerTwoName)}` : null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
      className="relative overflow-hidden rounded-[1.75rem] border border-dourado/40 bg-papel px-7 py-12 text-center shadow-[0_40px_80px_-40px_rgba(70,40,20,0.45)] sm:px-12"
    >
      <Bloom className="mx-auto w-20" delay={0.2} />
      <p className="mt-6 text-xs font-medium tracking-[0.36em] text-dourado uppercase">Tudo pronto</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,8vw,3.2rem)] leading-tight text-vinho">
        {names ? `Bem-vindos, ${names}!` : "Bem-vindos!"}
      </h1>
      <div className="mx-auto mt-6 max-w-[46ch] space-y-4 text-[1.02rem] leading-relaxed text-tinta/85">
        <p>
          Muitos parabéns pelo vosso casamento e obrigado, de coração, por terem escolhido o meu trabalho para fazer parte deste momento tão
          especial.
        </p>
        <p>
          Preparei este convite com todo o cuidado, para que cada convidado sinta o carinho com que o esperam. A partir de agora, o painel é
          vosso: podem editar o convite e acompanhar as respostas, a lista de presentes e as memórias do grande dia.
        </p>
        <p>Desejo-vos um dia inesquecível e uma vida inteira cheia de amor.</p>
      </div>
      <Ornament className="mt-8 text-dourado" />
      <p className="mt-6 text-sm text-pedra">Assinado,</p>
      <p className="mt-1 font-display text-3xl text-vinho">Francisco Afonso</p>

      <button type="button" className={`mt-10 ${buttonPrimary}`} onClick={onContinue}>
        Entrar no painel
      </button>
    </motion.section>
  );
}
