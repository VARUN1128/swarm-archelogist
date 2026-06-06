interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-white md:text-3xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
    </div>
  );
}
