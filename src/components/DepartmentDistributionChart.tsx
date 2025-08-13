import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "@/components/ThemeProvider";

interface ChartData {
  name: string;
  value: number;
}

interface DepartmentDistributionChartProps {
  data: ChartData[];
}

// A larger set of colors for potentially many departments
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF',
  '#19AFFF', '#19FFC0', '#AFFF19', '#FFC019', '#FF6B19', '#D419FF'
];

export function DepartmentDistributionChart({ data }: DepartmentDistributionChartProps) {
  const { theme } = useTheme();

  if (data.every(item => item.value === 0) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No department data to display yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend 
          layout="vertical" 
          align="right" 
          verticalAlign="middle" 
          wrapperStyle={{ fontSize: '0.875rem', lineHeight: '1.5rem' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}