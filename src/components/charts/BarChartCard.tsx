import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartCardProps {
  data: BarItem[];
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
  formatValue = (v) => v.toLocaleString(),
}: BarChartCardProps) {
  return (
    <div className="flex flex-col h-full">
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</h4>}
      <div className="flex-1" style={{ height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {horizontal ? (
            <BarChart
              data={data}
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
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color || barColor} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
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
                {data.map((entry, index) => (
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
