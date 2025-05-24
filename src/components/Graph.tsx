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
}: MultiGraphProps) {
  if (!solution.results.length) return null;

  // Генерируем данные для всех функций
  const allData = solution.results.map((result, index) => {
    const color = COLORS[index % COLORS.length];
    const functionData = result.xs.map((x, idx) => {
      return {
        x,
        [`y_${index}-exact`]: result.exactY[idx],
        [`y_${index}`]: result.ys[idx],
        name: result.name,
        color,
      };
    });

    return {
      name: result.name,
      data: functionData,
      color,
    };
  });

  // Подготовка данных для отображения

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      {allData.map((approx, index) => {
        return (
          <ComposedChart
            width={600}
            height={450}
            key={`graph-${index}`}
            data={approx.data}
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
              dataKey={`y_${index}-exact`}
              name="Точное решение"
              stroke={approx.color}
              dot={false}
            />
            <Scatter
              name={approx.name}
              dataKey={`y_${index}`}
              fill="#ff0000"
              radius={1}
              shape="circle"
            />
          </ComposedChart>
        );
      })}
    </div>
  );
});
