type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black text-sky-950">{title}</h2>

        {description ? (
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
