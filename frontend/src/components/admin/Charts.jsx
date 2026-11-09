import { AnimatedNumber } from '../ui/AnimatedNumber.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

const statusColors = {
  pending: '#d9a441',
  confirmed: '#4f7cac',
  preparing: '#6c63a8',
  delivered: '#2f8f6b',
  cancelled: '#b4576b',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  format,
  hint,
  accent = 'var(--color-forest)',
  delay = 0,
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-[1.75rem] border border-forest/10 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(14,42,35,0.5)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(14,42,35,0.45)]"
      style={{ animation: `fade-up 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
            <AnimatedNumber value={value} format={format} />
          </p>
          {hint && <p className="mt-2 text-xs text-ink/45">{hint}</p>}
        </div>
        <span
          className="grid size-11 shrink-0 place-items-center rounded-2xl text-white"
          style={{ backgroundColor: accent }}
        >
          {Icon && <Icon className="size-5" aria-hidden="true" />}
        </span>
      </div>
      <div className="mt-5 flex h-8 items-end gap-1">
        {[38, 62, 44, 78, 56, 88, 70].map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-t-full bg-current opacity-15 transition-all duration-500 group-hover:opacity-30"
            style={{
              height: `${height}%`,
              color: accent,
              animation: `grow-up 0.9s cubic-bezier(0.22,1,0.36,1) ${delay + index * 60}ms both`,
            }}
          />
        ))}
      </div>
    </article>
  );
}

export function SalesChart({ data = [] }) {
  const width = 640;
  const height = 240;
  const padding = { top: 24, right: 18, bottom: 34, left: 18 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((entry) => entry.total), 1);
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((entry, index) => ({
    ...entry,
    x: padding.left + index * stepX,
    y: padding.top + innerHeight - (entry.total / max) * innerHeight,
  }));

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');

  const area =
    points.length > 0
      ? `${line} L ${points.at(-1).x} ${padding.top + innerHeight} L ${points[0].x} ${
          padding.top + innerHeight
        } Z`
      : '';

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Sales over the last 7 days">
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c7a46b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c7a46b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerHeight * ratio}
            y2={padding.top + innerHeight * ratio}
            stroke="var(--color-forest)"
            strokeOpacity="0.08"
            strokeDasharray="4 6"
          />
        ))}

        {area && <path d={area} fill="url(#salesArea)" className="chart-area" />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke="var(--color-forest)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="chart-line"
          />
        )}

        {points.map((point, index) => (
          <g key={point.date || index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="9"
              fill="#c7a46b"
              opacity="0.18"
              className="chart-dot-halo"
              style={{ animationDelay: `${index * 90 + 500}ms` }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="var(--color-forest)"
              stroke="var(--color-ivory)"
              strokeWidth="2"
              className="chart-dot"
              style={{ animationDelay: `${index * 90 + 500}ms` }}
            >
              <title>{`${point.label}: ${formatCurrency(point.total)}`}</title>
            </circle>
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-ink/40"
              style={{ fontSize: 11, fontWeight: 700 }}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function TopProductsChart({ data = [] }) {
  const max = Math.max(...data.map((entry) => entry.quantity), 1);

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-ink/40">No sales yet.</p>;
  }

  return (
    <ul className="space-y-5">
      {data.map((entry, index) => (
        <li key={entry._id}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-forest">{entry._id}</span>
            <span className="shrink-0 text-xs font-bold text-ink/45">
              {entry.quantity} sold
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-forest/8">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-forest to-gold"
              style={{
                width: `${Math.max(6, (entry.quantity / max) * 100)}%`,
                transformOrigin: 'left',
                animation: `grow-bar 1s cubic-bezier(0.22,1,0.36,1) ${index * 110}ms both`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({ breakdown = {} }) {
  const entries = Object.entries(breakdown).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 160 160" className="size-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--color-forest)" strokeOpacity="0.08" strokeWidth="16" />
          {total > 0 &&
            entries.map(([status, count]) => {
              const dash = (count / total) * circumference;
              const element = (
                <circle
                  key={status}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={statusColors[status] || 'var(--color-forest)'}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0, dash - 4)} ${circumference - dash + 4}`}
                  strokeDashoffset={-offset}
                  className="donut-segment"
                  style={{ animationDelay: `${offset}ms` }}
                />
              );
              offset += dash;
              return element;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-3xl font-semibold text-forest">
              <AnimatedNumber value={total} />
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
              Orders
            </p>
          </div>
        </div>
      </div>

      <ul className="w-full space-y-3">
        {Object.entries(statusLabels).map(([status, label]) => (
          <li key={status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink/60">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: statusColors[status] }}
              />
              {label}
            </span>
            <span className="font-bold text-forest">{breakdown[status] || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
