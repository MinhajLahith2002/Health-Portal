export default function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-1 text-xs font-bold uppercase text-blue-700">{eyebrow}</p>}<h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p></div>{action}</div>;
}
