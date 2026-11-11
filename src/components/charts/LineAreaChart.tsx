import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { asArray, asNumber, asString } from '@/lib/normalize';

interface TimelineItem {
  period?: unknown;
  amount?: unknown;
  target?: unknown;
}

interface LineAreaChartProps {
  data?: TimelineItem[] | null;
  title?: string;
  height?: number;
}

export function LineAreaChart({ data, title, height = 260 }: LineAreaChartProps) {
  const safeData = asArray<TimelineItem>(data)
    .filter((item) => item != null && typeof item === 'object')
    .map((item) => ({
      period: asString(item.period),
      amount: asNumber(item.amount),
      ...(item.target != null ? { target: asNumber(item.target) } : {}),
    }));
  if (safeData.length === 0) {
    return <div className="text-xs text-slate-400 p-4">No data</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</h4>}
      <div className="flex-1" style={{ height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1F7A57" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1F7A57" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) =>
                Number.isFinite(Number(v)) ? `${(Number(v) / 1000).toFixed(0)}k` : ''
              }
            />
            <Tooltip
              formatter={(val: unknown) => [
                `ETB ${asNumber(val).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                'Collected',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0B3D2E"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGreen)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
