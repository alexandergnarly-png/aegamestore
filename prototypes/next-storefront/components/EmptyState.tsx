type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon = "🔎",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-sky-100">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-black text-sky-950">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
