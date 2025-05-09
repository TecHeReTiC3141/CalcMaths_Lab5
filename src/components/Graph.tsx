import {
  ComposedChart,
  Line,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { SolutionData } from "../utils";
import { memo } from "react";

interface MultiGraphProps {
  solution: SolutionData;
  segments?: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ff7300",
  "#ffc658",
  "#a4de6c",
  "#d0ed57",
];

export const MultiGraph = memo(function MultiGraph({
  solution,
  segments = 300,
}: MultiGraphProps) {
  if (!solution.interpolations.length || !solution.points.length) return null;

  // Определяем интервал по введенным точкам
  const xValues = solution.points.map(([x]) => x);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const intervalSize = maxX - minX;

  // Добавляем небольшой запас по краям
  const padding = intervalSize * 0.1;
  const a = minX - padding;
  const b = maxX + padding;

  // Генерируем данные для всех функций
  const allData = solution.interpolations.map((interpolation, index) => {
    const color = COLORS[index % COLORS.length];
    const functionData = Array.from({ length: segments }).map((_, i) => {
      const x = a + (i / (segments - 1)) * (b - a);
      return {
        x,
        [`y_${index}`]: interpolation.fn(x),
        name: interpolation.name,
        color,
      };
    });

    return {
      name: interpolation.name,
      data: functionData,
      color,
    };
  });

  // Подготовка данных для отображения
  const chartData = allData[0].data
    .map((point, i) => {
      const result: any = { x: point.x };
      allData.forEach((approx, idx) => {
        result[`y_${idx}`] = approx.data[i][`y_${idx}`];
        result[`name_${idx}`] = approx.name;
      });
      return result;
    })
    .concat(
      ...solution.points.map(([x, y]) => {
        const point: any = { x, y };
        solution.interpolations.forEach((interpolation, idx) => {
          point[`y_${idx}`] = interpolation.fn(x);
          point[`name_${idx}`] = interpolation.name;
        });

        return point;
      }),
      ...solution.interpolations.map((interpolation, idx) => ({
        x: solution.interpolationPoint,
        [`solution_${idx}`]: interpolation.fn(solution.interpolationPoint)
      }))
    )
    .sort((a, b) => a.x - b.x);

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      {allData.map((approx, index) => (
        <ComposedChart
          width={600}
          height={450}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={`y_${index}`}
            name={approx.name}
            stroke={approx.color}
            dot={false}
          />
          <Scatter
            name="Исходные точки"
            dataKey="y"
            fill="#ff0000"
            shape="circle"
          />
          <Scatter
            name="Точка интерполяции"
            dataKey={`solution_${index}`}
            fill="#00aa00"
            shape="circle"
          />
        </ComposedChart>
      ))}
    </div>
  );
});
