import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { asNumber, asString } from '@/lib/normalize';

interface BarItem {
  label?: unknown;
  value?: unknown;
  color?: unknown;
}

interface BarChartCardProps {
  data?: BarItem[] | null;
  title?: string;
  horizontal?: boolean;
  height?: number;
  barColor?: string;
  formatValue?: (val: number) => string;
}

export function BarChartCard({
  data,
  title,
  horizontal = false,
  height = 260,
  barColor = '#14573F',
  formatValue = (v) => asNumber(v).toLocaleString('en-US', { maximumFractionDigits: 0 }),
}: BarChartCardProps) {
  const safeData = Array.isArray(data)
    ? data
        .filter((item): item is BarItem => item != null && typeof item === 'object')
        .map((item) => ({
          label: asString(item.label),
          value: asNumber(item.value),
          color: asString(item.color),
        }))
    : [];
  if (safeData.length === 0) {
    return <div className="text-xs text-slate-400 p-4">No data</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</h4>}
      <div className="flex-1" style={{ height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {horizontal ? (
            <BarChart
              data={safeData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                tick={{ fontSize: 11, fill: '#334155' }}
              />
              <Tooltip
                formatter={(val: unknown) => [formatValue(Number(val)), 'Members']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {safeData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color || barColor} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={safeData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: unknown) => [formatValue(Number(val)), 'Count']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {safeData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color || barColor} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
