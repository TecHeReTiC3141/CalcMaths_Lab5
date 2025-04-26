import {
  computeCoefficientOfDetermination,
  computeMeanSquaredError,
  computeMeasureOfDeviation,
  computePearsonCorrelation,
  cubicApproximation,
  exponentialApproximation,
  linearApproximation, logarithmicApproximation, powerApproximation,
  quadraticApproximation
} from "./approxFunctions.ts";
import { SEGMENTS } from "../constants.ts";

export type Point = [number, number];
export type ApproximationResult = {
  name: string;
  fn: (x: number) => number;
  coefficients: number[];
  standardDeviation: number;
  measureOfDeviation: number;
  determinationCoefficient: number;
  pearsonCorrelation?: number;
};

export const getPoints = (value: string): Point[] | null => {
  const lines = value.split('\n')
  const points = lines.map((line) => line.split(' ').map((val) => +val))
  if (points.some(([x, y]) => isNaN(x) || isNaN(y))) {
    return null
  }
  return points
}

export function getApproximations(points: Point[]): ApproximationResult[] {
  const n = points.length;
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);

  // Проверка на корректность данных
  if (n < 8 || n > 12) {
    throw new Error("Количество точек должно быть от 8 до 12");
  }

  // Проверка на наличие отрицательных значений для определенных аппроксимаций
  const hasNegativeX = xs.some(x => x <= 0);
  const hasNegativeY = ys.some(y => y <= 0);

  const results: ApproximationResult[] = [];

  // 1. Линейная аппроксимация
  const [linearFn, aLinear, bLinear] = linearApproximation(xs, ys, n);
  const linearResult: ApproximationResult = {
    name: "Линейная",
    fn: linearFn,
    coefficients: [aLinear, bLinear],
    standardDeviation: computeMeanSquaredError(xs, ys, linearFn, n),
    measureOfDeviation: computeMeasureOfDeviation(xs, ys, linearFn, n),
    determinationCoefficient: computeCoefficientOfDetermination(xs, ys, linearFn, n),
    pearsonCorrelation: computePearsonCorrelation(xs, ys, n)
  };
  results.push(linearResult);

  // 2. Квадратичная аппроксимация
  const [quadraticFn, aQuad, bQuad, cQuad] = quadraticApproximation(xs, ys, n);
  results.push({
    name: "Квадратичная",
    fn: quadraticFn,
    coefficients: [aQuad, bQuad, cQuad],
    standardDeviation: computeMeanSquaredError(xs, ys, quadraticFn, n),
    measureOfDeviation: computeMeasureOfDeviation(xs, ys, quadraticFn, n),
    determinationCoefficient: computeCoefficientOfDetermination(xs, ys, quadraticFn, n)
  });

  // 3. Кубическая аппроксимация
  const [cubicFn, aCubic, bCubic, cCubic, dCubic] = cubicApproximation(xs, ys, n);
  results.push({
    name: "Кубическая",
    fn: cubicFn,
    coefficients: [aCubic, bCubic, cCubic, dCubic],
    standardDeviation: computeMeanSquaredError(xs, ys, cubicFn, n),
    measureOfDeviation: computeMeasureOfDeviation(xs, ys, cubicFn, n),
    determinationCoefficient: computeCoefficientOfDetermination(xs, ys, cubicFn, n)
  });

  // 4. Экспоненциальная аппроксимация (только если все y > 0)
  if (!hasNegativeY) {
    try {
      const [expFn, aExp, bExp] = exponentialApproximation(xs, ys, n);
      results.push({
        name: "Экспоненциальная",
        fn: expFn,
        coefficients: [aExp, bExp],
        standardDeviation: computeMeanSquaredError(xs, ys, expFn, n),
        measureOfDeviation: computeMeasureOfDeviation(xs, ys, expFn, n),
        determinationCoefficient: computeCoefficientOfDetermination(xs, ys, expFn, n)
      });
    } catch (e) {
      console.warn("Не удалось вычислить экспоненциальную аппроксимацию:", e.message);
    }
  }

  // 5. Логарифмическая аппроксимация (только если все x > 0)
  if (!hasNegativeX) {
    try {
      const [logFn, aLog, bLog] = logarithmicApproximation(xs, ys, n);
      results.push({
        name: "Логарифмическая",
        fn: logFn,
        coefficients: [aLog, bLog],
        standardDeviation: computeMeanSquaredError(xs, ys, logFn, n),
        measureOfDeviation: computeMeasureOfDeviation(xs, ys, logFn, n),
        determinationCoefficient: computeCoefficientOfDetermination(xs, ys, logFn, n)
      });
    } catch (e) {
      console.warn("Не удалось вычислить логарифмическую аппроксимацию:", e.message);
    }
  }

  // 6. Степенная аппроксимация (только если все x > 0 и все y > 0)
  if (!hasNegativeX && !hasNegativeY) {
    try {
      const [powerFn, aPower, bPower] = powerApproximation(xs, ys, n);
      results.push({
        name: "Степенная",
        fn: powerFn,
        coefficients: [aPower, bPower],
        standardDeviation: computeMeanSquaredError(xs, ys, powerFn, n),
        measureOfDeviation: computeMeasureOfDeviation(xs, ys, powerFn, n),
        determinationCoefficient: computeCoefficientOfDetermination(xs, ys, powerFn, n)
      });
    } catch (e) {
      console.warn("Не удалось вычислить степенную аппроксимацию:", e.message);
    }
  }

  // Находим лучшую аппроксимацию (с наименьшей мерой отклонения)
  const bestApproximation = results.reduce((best, current) =>
    current.measureOfDeviation < best.measureOfDeviation ? current : best
  );

  // Вывод результатов в консоль
  console.log("Результаты аппроксимации:");
  console.log("------------------------------------------------------------");
  results.forEach(result => {
    console.log(`${result.name} функция:`);
    console.log(`Коэффициенты: ${result.coefficients.map(c => c.toFixed(4)).join(", ")}`);
    console.log(`Среднеквадратичное отклонение: ${result.standardDeviation.toFixed(4)}`);
    console.log(`Мера отклонения: ${result.measureOfDeviation.toFixed(4)}`);
    console.log(`Коэффициент детерминации: ${result.determinationCoefficient.toFixed(4)}`);

    if (result.pearsonCorrelation !== undefined) {
      console.log(`Коэффициент корреляции Пирсона: ${result.pearsonCorrelation.toFixed(4)}`);
    }

    // Интерпретация коэффициента детерминации
    const r2 = result.determinationCoefficient;
    let interpretation = "";
    if (r2 >= 0.95) {
      interpretation = "Отличное соответствие";
    } else if (r2 >= 0.75) {
      interpretation = "Хорошее соответствие";
    } else if (r2 >= 0.5) {
      interpretation = "Удовлетворительное соответствие";
    } else {
      interpretation = "Слабое соответствие";
    }
    console.log(`Интерпретация: ${interpretation}`);
    console.log("------------------------------------------------------------");
  });

  console.log("\nНаилучшая аппроксимирующая функция:");
  console.log(`${bestApproximation.name} функция с мерой отклонения ${bestApproximation.measureOfDeviation.toFixed(4)}`);

  // Генерация данных для графиков
  // const step = (interval[1] - interval[0]) / SEGMENTS;
  // const graphData = results.map(result => {
  //   const values: Point[] = [];
  //   for (let x = interval[0]; x <= interval[1]; x += step) {
  //     values.push([x, result.fn(x)]);
  //   }
  //   return {
  //     name: result.name,
  //     values,
  //     isBest: result.name === bestApproximation.name
  //   };
  // });

  return results;
}