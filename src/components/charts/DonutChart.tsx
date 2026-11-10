import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DonutItem {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface DonutChartProps {
  data: DonutItem[];
  title?: string;
  totalLabel?: string;
  height?: number;
  formatValue?: (val: number) => string;
}

const DEFAULT_COLORS = ['#0B3D2E', '#C9A24A', '#1F7A57', '#E8772E', '#2F6FB5', '#718096'];

export function DonutChart({
  data,
  title,
  totalLabel,
  height = 240,
  formatValue = (v) => v.toLocaleString(),
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full">
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</h4>}
      <div className="relative flex-1" style={{ height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown, name: unknown) => [
                formatValue(Number(value)),
                String(name),
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {totalLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatValue(total)}
            </span>
            <span className="text-2xs text-slate-500 uppercase tracking-wider">{totalLabel}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
            />
            <span className="font-medium truncate max-w-[130px]">{item.name}</span>
            <span className="text-slate-400 tabular-nums font-semibold">({formatValue(item.value)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
