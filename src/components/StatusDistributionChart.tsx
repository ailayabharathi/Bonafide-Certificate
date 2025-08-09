import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "@/components/ThemeProvider";

interface ChartData {
  name: string;
  value: number;
}

interface StatusDistributionChartProps {
  data: ChartData[];
}

const COLORS = {
  light: ['#fbbf24', '#34d399', '#f87171'], // amber-400, emerald-400, red-400
  dark: ['#fcd34d', '#6ee7b7', '#ef4444'], // amber-300, emerald-300, red-500
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const { theme } = useTheme();
  const chartColors = theme === 'dark' ? COLORS.dark : COLORS.light;

  if (data.every(item => item.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No request data to display yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}