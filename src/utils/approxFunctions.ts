type ApproxFunction = (x: number) => number;

// Реализация функций из предыдущего ответа (solve2, solve3, solve4, solveSLE)
// ... (вставьте сюда реализацию из предыдущего ответа)

export function linearApproximation(xs: number[], ys: number[], n: number): [ApproxFunction, number, number] {
  const sx = xs.reduce((sum, x) => sum + x, 0);
  const sxx = xs.reduce((sum, x) => sum + x ** 2, 0);
  const sy = ys.reduce((sum, y) => sum + y, 0);
  const sxy = xs.reduce((sum, x, i) => sum + x * ys[i], 0);

  const [a, b] = solveSLE(
    [
      [n, sx],
      [sx, sxx]
    ],
    [sy, sxy],
    2
  ) as [number, number];

  return [(xi: number) => a + b * xi, a, b];
}

export function quadraticApproximation(xs: number[], ys: number[], n: number): [ApproxFunction, number, number, number] {
  const sx = xs.reduce((sum, x) => sum + x, 0);
  const sxx = xs.reduce((sum, x) => sum + x ** 2, 0);
  const sxxx = xs.reduce((sum, x) => sum + x ** 3, 0);
  const sxxxx = xs.reduce((sum, x) => sum + x ** 4, 0);
  const sy = ys.reduce((sum, y) => sum + y, 0);
  const sxy = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sxxy = xs.reduce((sum, x, i) => sum + x * x * ys[i], 0);

  const [a, b, c] = solveSLE(
    [
      [n, sx, sxx],
      [sx, sxx, sxxx],
      [sxx, sxxx, sxxxx]
    ],
    [sy, sxy, sxxy],
    3
  ) as [number, number, number];

  return [(xi: number) => a + b * xi + c * xi ** 2, a, b, c];
}

export function cubicApproximation(xs: number[], ys: number[], n: number): [ApproxFunction, number, number, number, number] {
  const sx = xs.reduce((sum, x) => sum + x, 0);
  const sxx = xs.reduce((sum, x) => sum + x ** 2, 0);
  const sxxx = xs.reduce((sum, x) => sum + x ** 3, 0);
  const sxxxx = xs.reduce((sum, x) => sum + x ** 4, 0);
  const sxxxxx = xs.reduce((sum, x) => sum + x ** 5, 0);
  const sxxxxxx = xs.reduce((sum, x) => sum + x ** 6, 0);
  const sy = ys.reduce((sum, y) => sum + y, 0);
  const sxy = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sxxy = xs.reduce((sum, x, i) => sum + x * x * ys[i], 0);
  const sxxxy = xs.reduce((sum, x, i) => sum + x * x * x * ys[i], 0);

  const [a, b, c, d] = solveSLE(
    [
      [n, sx, sxx, sxxx],
      [sx, sxx, sxxx, sxxxx],
      [sxx, sxxx, sxxxx, sxxxxx],
      [sxxx, sxxxx, sxxxxx, sxxxxxx]
    ],
    [sy, sxy, sxxy, sxxxy],
    4
  ) as [number, number, number, number];

  return [(xi: number) => a + b * xi + c * xi ** 2 + d * xi ** 3, a, b, c, d];
}

export function exponentialApproximation(xs: number[], ys: number[], n: number): [ApproxFunction, number, number] {
  const ys_ = ys.map(y => Math.log(y));
  const [_, a_, b_] = linearApproximation(xs, ys_, n);
  const a = Math.exp(a_);
  const b = b_;
  return [(xi: number) => a * Math.exp(b * xi), a, b];
}

export function logarithmicApproximation(xs: number[], ys: number[], n: number): [ApproxFunction, number, number] {
  const xs_ = xs.map(x => Math.log(x));
  const [_, a_, b_] = linearApproximation(xs_, ys, n);
  const a = a_;
  const b = b_;
  return [(xi: number) => a + b * Math.log(xi), a, b];
}

export function powerApproximation(xs: number[], ys: number[], n: number): [ApproxFunction, number, number] {
  const xs_ = xs.map(x => Math.log(x));
  const ys_ = ys.map(y => Math.log(y));
  const [_, a_, b_] = linearApproximation(xs_, ys_, n);
  const a = Math.exp(a_);
  const b = b_;
  return [(xi: number) => a * xi ** b, a, b];
}

export function computePearsonCorrelation(x: number[], y: number[], n: number): number {
  const av_x = x.reduce((sum, xi) => sum + xi, 0) / n;
  const av_y = y.reduce((sum, yi) => sum + yi, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - av_x) * (y[i] - av_y), 0);
  const denominator = Math.sqrt(
    x.reduce((sum, xi) => sum + (xi - av_x) ** 2, 0) *
    y.reduce((sum, yi) => sum + (yi - av_y) ** 2, 0)
  );

  return numerator / denominator;
}

export function computeMeanSquaredError(x: number[], y: number[], fi: ApproxFunction, n: number): number {
  return Math.sqrt(
    x.reduce((sum, xi, i) => sum + (fi(xi) - y[i]) ** 2, 0) / n
  );
}

export function computeMeasureOfDeviation(x: number[], y: number[], fi: ApproxFunction, n: number): number {
  return x.reduce((sum, xi, i) => sum + (fi(xi) - y[i]) ** 2, 0);
}

export function computeCoefficientOfDetermination(xs: number[], ys: number[], fi: ApproxFunction, n: number): number {
  const av_fi = xs.reduce((sum, x) => sum + fi(x), 0) / n;
  const numerator = ys.reduce((sum, y, i) => sum + (y - fi(xs[i])) ** 2, 0);
  const denominator = ys.reduce((sum, y) => sum + (y - av_fi) ** 2, 0);

  return 1 - numerator / denominator;
}