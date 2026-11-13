import Link from "next/link";

/** Página simples para estados especiais (configuração em falta, convite por criar). */
export function NoticePage({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col justify-center px-6 py-16">
      <p className="font-display text-xl tracking-wide text-dourado">Enlace</p>
      <h1 className="mt-4 font-display text-[2.6rem] leading-tight">{title}</h1>
      <div className="mt-6 space-y-4 text-pedra">{children}</div>
      {action && (
        <Link
          href={action.href}
          className="mt-10 inline-flex w-fit items-center rounded-full bg-cartao px-7 py-3 font-medium text-sobre-cartao transition-transform hover:-translate-y-0.5"
        >
          {action.label}
        </Link>
      )}
    </main>
  );
}
