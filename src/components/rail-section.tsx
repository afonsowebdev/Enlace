type RailSectionProps = {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  last?: boolean;
};

/**
 * Uma secção pendurada no fio. O nó marca um passo do percurso do convidado.
 */
export function RailSection({ id, title, intro, children, last = false }: RailSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={`relative scroll-mt-8 pl-7 ${last ? "pb-4" : "border-l-[1.5px] border-cobalto pb-20"}`}
    >
      {last && <span aria-hidden="true" className="absolute top-0 left-0 h-6 border-l-[1.5px] border-cobalto" />}
      <span
        aria-hidden="true"
        className="absolute top-[1.15rem] -left-[0.3rem] size-[0.7rem] rounded-full border-[1.5px] border-cobalto bg-porcelana"
      />
      <h2 id={`${id}-titulo`} className="pt-1 font-display text-2xl leading-tight sm:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-[60ch] text-pedra">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}
