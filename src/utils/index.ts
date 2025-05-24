import { NumericalMethod } from "../types";

/**
 * Обычный метод Эйлера (явный) для решения ОДУ dy/dx = f(x, y)
 * @param f - функция f(x, y) (правая часть ОДУ)
 * @param xs - массив значений x (узлов сетки)
 * @param y0 - начальное значение y(x0)
 * @returns массив значений y в точках xs
 */
function eulerMethod(
  f: (x: number, y: number) => number,
  xs: number[],
  y0: number,
  eps: number
): number[] {
  const ys: number[] = [y0];
  const h = xs[1] - xs[0];

  for (let i = 0; i < xs.length; i++) {
    const yNext = ys[i] + h * f(xs[i], ys[i]);
    ys.push(yNext);
  }

  return ys;
}

/**
 * Улучшенный метод Эйлера (модифицированный, метод Хьюна)
 * @param f - функция f(x, y) (правая часть ОДУ)
 * @param xs - массив значений x (узлов сетки)
 * @param y0 - начальное значение y(x0)
 * @param eps - параметр точности (не используется, оставлен для совместимости)
 * @returns массив значений y в точках xs
 */
function improvedEulerMethod(
  f: (x: number, y: number) => number,
  xs: number[],
  y0: number,
  eps: number
): number[] {
  const ys: number[] = [y0];
  const h = xs[1] - xs[0];

  for (let i = 0; i < xs.length; i++) {
    const k1 = f(xs[i], ys[i]); // наклон в начальной точке
    const k2 = f(xs[i] + h, ys[i] + h * k1); // наклон в прогнозируемой точке
    const yNext = ys[i] + 0.5 * h * (k1 + k2); // усредненный шаг
    ys.push(yNext);
  }

  return ys;
}

/**
 * Метод Адамса-Бэшфорта 4-го порядка для решения ОДУ dy/dx = f(x, y)
 * @param f - функция f(x, y) (правая часть ОДУ)
 * @param xs - массив значений x (узлов сетки)
 * @param y0 - начальное значение y(x0)
 * @param eps - параметр точности (не используется, оставлен для совместимости)
 * @returns массив значений y в точках xs
 */
function adamsBashforthMethod(
  f: (x: number, y: number) => number,
  xs: number[],
  y0: number,
  eps: number
): number[] {
  if (xs.length < 4) {
    throw new Error("Метод Адамса-Бэшфорта требует минимум 4 точки");
  }

  const h = xs[1] - xs[0]; // шаг (предполагаем равномерную сетку)
  const ys: number[] = [y0];

  // Вычисляем первые 4 точки с помощью улучшенного метода Эйлера
  const initialPoints = Math.min(4, xs.length);
  for (let i = 1; i < initialPoints; i++) {
    const k1 = h * f(xs[i - 1], ys[i - 1]);
    const k2 = h * f(xs[i - 1] + h / 2, ys[i - 1] + k1 / 2);
    const k3 = h * f(xs[i - 1] + h / 2, ys[i - 1] + k2 / 2);
    const k4 = h * f(xs[i - 1] + h, ys[i - 1] + k3);
    ys.push(ys[i - 1] + (k1 + 2 * k2 + 2 * k3 + k4) / 6);
  }

  // Основной цикл метода Адамса-Бэшфорта 4-го порядка
  for (let i = 4; i < xs.length; i++) {
    const f0 = f(xs[i - 1], ys[i - 1]);
    const f1 = f(xs[i - 2], ys[i - 2]);
    const f2 = f(xs[i - 3], ys[i - 3]);
    const f3 = f(xs[i - 4], ys[i - 4]);

    let yNext = ys[i - 1] + (h * (55 * f0 - 59 * f1 + 37 * f2 - 9 * f3)) / 24;

    while (true) {
      const yc =
        ys[i - 1] + (h / 24) * (9 * f(xs[i], yNext) + 19 * f0 - 5 * f1 + f2);
      if (Math.abs(yc - yNext) < eps) {
        yNext = yc;
        break;
      }
      yNext = yc;
    }
    ys.push(yNext);
  }

  return ys;
}

interface MethodInfo {
  name: string;
  method: NumericalMethod;
  order: number;
}

const MAX_ITERS = 20;
const INF = Number.MAX_VALUE;

type SolutionResult = {
  xs: number[];
  ys: number[];
  exactY: number[];
  inaccuracy: number;
  divCount: number;
  h: number;
  iters: number;
  name: string;
};

export type SolutionData = {
  results: SolutionResult[];
  accuracy: number;
};

const methods: MethodInfo[] = [
  { name: "Метод Эйлера", method: eulerMethod, order: 1 },
  { name: "Улучшенный метод Эйлера", method: improvedEulerMethod, order: 2 },
  { name: "Метод Адамса-Бэшфорта", method: adamsBashforthMethod, order: 4 },
];

export function solve(
  f: (x: number, y: number) => number,
  exactSolution: (x: number, x0: number, y0: number) => number,
  x0: number,
  xn: number,
  initialN: number,
  y0: number,
  eps: number
): SolutionData {
  const results: SolutionResult[] = [];

  for (const { name, method, order } of methods) {
    console.log(`${name}:\n`);
    let ni = initialN;
    let inaccuracy = INF;

    let xs = Array.from({ length: ni }, (_, i) => x0 + (i * (xn - x0)) / ni);
    let ys = method(f, xs, y0, eps);

    for (let iters = 0; iters < MAX_ITERS; ++iters) {
      if (inaccuracy <= eps) {
        results.push({
          xs,
          ys,
          exactY: xs.map((x) => exactSolution(x, x0, y0)),
          inaccuracy,
          divCount: ni,
          h: (xn - x0) / ni,
          iters: iters + 1,
          name,
        });
        console.log(
          `Для точности eps=${eps} интервал был разбит на n=${ni} частей с шагом h=${(
            (xn - x0) /
            ni
          ).toFixed(6)} за ${iters} итераций.\n`
        );

        console.log("y:\t[", ys.map((y) => y.toFixed(5)).join(", "), "]");
        console.log(
          "y_точн:\t[",
          xs.map((x) => exactSolution(x, x0, y0).toFixed(5)).join(", "),
          "]"
        );

        if (method === adamsBashforthMethod) {
          console.log(`Погрешность (max|y_iточн - y_i|): ${inaccuracy}`);
        } else {
          console.log(`Погрешность (по правилу Рунге): ${inaccuracy}`);
        }
        break;
      }

      iters++;
      ni *= 2;
      const newXs = Array.from(
        { length: ni },
        (_, i) => x0 + (i * (xn - x0)) / ni
      );
      const newYs = method(f, newXs, y0, eps);

      if (method === adamsBashforthMethod) {
        inaccuracy = Math.max(
          ...newXs.map((x, i) => Math.abs(exactSolution(x, x0, y0) - newYs[i]))
        );
      } else {
        const coef = Math.pow(2, order) - 1;
        inaccuracy =
          Math.abs(newYs[newYs.length - 1] - ys[ys.length - 1]) / coef;
      }

      xs = newXs;
      ys = newYs;
    }

    if (inaccuracy > eps) {
      console.log(
        `! Не удалось увеличить точность. Произведено ${MAX_ITERS} итераций.`
      );
    }
  }

  return {
    results,
    accuracy: eps,
  };
}
