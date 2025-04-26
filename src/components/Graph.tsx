import { ComposedChart, Line, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ApproximationResult } from "../utils";

interface Point {
  x: number;
  y: number;
}
interface MultiGraphProps {
  approximations: ApproximationResult[];
  inputPoints: Point[];
  segments?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#ffc658', '#a4de6c', '#d0ed57'];

export const MultiGraph = ({
                                                        approximations,
                                                        inputPoints,
                                                        segments = 100
                                                      }: MultiGraphProps) => {
  if (!approximations.length || !inputPoints.length) return null;

  // Определяем интервал по введенным точкам
  const xValues = inputPoints.map(p => p.x);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const intervalSize = maxX - minX;

  // Добавляем небольшой запас по краям
  const padding = intervalSize * 0.1;
  const a = minX - padding;
  const b = maxX + padding;

  // Генерируем данные для всех функций
  const allData = approximations.map((approx, index) => {
    const color = COLORS[index % COLORS.length];
    const functionData = Array.from({ length: segments }).map((_, i) => {
      const x = a + (i / (segments - 1)) * (b - a);
      return {
        x,
        [`y_${index}`]: approx.fn(x),
        name: approx.name,
        color
      };
    });

    return {
      name: approx.name,
      data: functionData,
      color
    };
  });

  // Подготовка данных для отображения
  const chartData = allData[0].data.map((point, i) => {
    const result: any = { x: point.x };
    allData.forEach((approx, idx) => {
      result[`y_${idx}`] = approx.data[i][`y_${idx}`];
      result[`name_${idx}`] = approx.name;
    });
    return result;
  });

  // Добавляем исходные точки
  const inputPointsData = inputPoints.map(point => ({
    x: point.x,
    ...point,
    isInput: true
  }));

  return (
    <ComposedChart
      width={800}
      height={500}
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" />
      <YAxis />
      <Tooltip />
      <Legend />

      {/* Линии аппроксимирующих функций */}
      {allData.map((approx, index) => (
        <Line
          key={`line-${index}`}
          type="monotone"
          dataKey={`y_${index}`}
          name={approx.name}
          stroke={approx.color}
          dot={false}
        />
      ))}

      {/* Исходные точки */}
      <Scatter
        name="Исходные точки"
        data={inputPointsData}
        dataKey="y"
        fill="#ff0000"
        shape="circle"
      />
    </ComposedChart>
  );
};