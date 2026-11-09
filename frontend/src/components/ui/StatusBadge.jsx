const tones = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-100 text-sky-800 border-sky-200',
  preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-rose-100 text-rose-700 border-rose-200',
  refunded: 'bg-slate-100 text-slate-700 border-slate-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  suspended: 'bg-rose-100 text-rose-700 border-rose-200',
};

export function StatusBadge({ status = 'pending', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
        tones[status] || tones.pending
      } ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {String(status).replaceAll('_', ' ')}
    </span>
  );
}
