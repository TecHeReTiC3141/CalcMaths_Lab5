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
  const lines = value.split('\n').map(line => line.trim()).filter((line) => line);
  const points = lines.map((line) => line.split(' ').map((val) => +val.replace(',', '.')) as Point)
  if (points.some(([x, y]) => isNaN(x) || isNaN(y))) {
    return null
  }
  return points
}

type Polynomial = (x: number) => number;

function factorial(n: number): number {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

function reduce<T>(arr: T[], fn: (a: T, b: T) => T, initial?: T): T {
    return arr.reduce(fn, initial as T);
}

function lagrangePolynomial(xs: number[], ys: number[], n: number): Polynomial {
    return (x: number) => {
        return ys.slice(0, n).reduce((sum, y, i) => {
            const term = reduce<number>(
                xs.slice(0, n)
                    .filter((_, j) => i !== j)
                    .map(xj => (x - xj) / (xs[i] - xj)),
                (a, b) => a * b,
                1
            );
            return sum + y * term;
        }, 0);
    };
}

function dividedDifferences(x: number[], y: number[]): number[] {
    const n = y.length;
    const coef = [...y].map(val => Number(val));
    
    for (let j = 1; j < n; j++) {
        for (let i = n - 1; i >= j; i--) {
            coef[i] = (coef[i] - coef[i - 1]) / (x[i] - x[i - j]);
        }
    }
    return coef;
}

function newtonDividedDifferencePolynomial(xs: number[], ys: number[], n: number): Polynomial {
    const coef = dividedDifferences(xs, ys);
    return (x: number) => {
        return ys[0] + reduce<number>(
            Array.from({length: n - 1}, (_, k) => k + 1),
            (sum, k) => {
                const term = reduce<number>(
                    Array.from({length: k}, (_, j) => x - xs[j]),
                    (a, b) => a * b,
                    1
                );
                return sum + coef[k] * term;
            },
            0
        );
    };
}

function finiteDifferences(y: number[]): number[][] {
    const n = y.length;
    const deltaY: number[][] = Array.from({length: n}, () => new Array(n).fill(NaN));
    
    for (let i = 0; i < n; i++) {
        deltaY[i][0] = y[i];
    }
    
    for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
            deltaY[i][j] = deltaY[i + 1][j - 1] - deltaY[i][j - 1];
        }
    }
    return deltaY;
}

function newtonFiniteDifferencePolynomial(xs: number[], ys: number[], n: number): Polynomial {
    const h = xs[1] - xs[0];
    const deltaY = finiteDifferences(ys);
    
    return (x: number) => {
        return ys[0] + reduce<number>(
            Array.from({length: n - 1}, (_, k) => k + 1),
            (sum, k) => {
                const term = reduce<number>(
                    Array.from({length: k}, (_, j) => (x - xs[0]) / h - j),
                    (a, b) => a * b,
                    1
                );
                return sum + term * deltaY[0][k] / factorial(k);
            },
            0
        );
    };
}

function gaussPolynomial(xs: number[], ys: number[], n: number): Polynomial {
    const alphaInd = Math.floor(n / 2);
    const finDifs = finiteDifferences(ys);

    const h = xs[1] - xs[0];
    const dts1 = [0, -1, 1, -2, 2, -3, 3, -4, 4];

    return (x: number) => (
      ys[alphaInd] + Array.from({length: n - 1}, (_, k) => k + 1).reduce<number>(
          (sum, k) => {
              const term = reduce<number>(
                  Array.from({length: k}, (_, j) => (x - xs[alphaInd]) / h + dts1[j]),
                  (a, b) => a * b,
                  1
              );
              let coeff;
              const diffCount = finDifs[k].filter(val => !isNaN(val)).length
              if (x > xs[alphaInd]) {
                coeff = finDifs[Math.floor(diffCount / 2)][k];
              } else {
                const index = Math.floor(diffCount / 2) - (1 - diffCount % 2);
                coeff = finDifs[index][k];
              }
              return sum + term * coeff / factorial(k);
          },
          0
      )
    )
}

function stirlingPolynomial(xs: number[], ys: number[], n: number): Polynomial {
    const alphaInd = Math.floor(n / 2);
    const finDifs: number[][] = [];
    finDifs.push([...ys]);

    for (let k = 1; k <= n; k++) {
        const last = [...finDifs[k - 1]];
        const newDif: number[] = [];
        for (let i = 0; i < n - k + 1; i++) {
            newDif.push(last[i + 1] - last[i]);
        }
        finDifs.push(newDif);
    }

    const h = xs[1] - xs[0];
    const dts1 = [0, -1, 1, -2, 2, -3, 3, -4, 4];

    const f1 = (x: number) => {
        return ys[alphaInd] + reduce<number>(
            Array.from({length: n}, (_, k) => k + 1),
            (sum, k) => {
                const term = reduce<number>(
                    Array.from({length: k}, (_, j) => (x - xs[alphaInd]) / h + dts1[j]),
                    (a, b) => a * b,
                    1
                );
                return sum + term * finDifs[k][Math.floor(finDifs[k].length / 2)] / factorial(k);
            },
            0
        );
    };

    const f2 = (x: number) => {
        return ys[alphaInd] + reduce<number>(
            Array.from({length: n}, (_, k) => k + 1),
            (sum, k) => {
                const term = reduce<number>(
                    Array.from({length: k}, (_, j) => (x - xs[alphaInd]) / h - dts1[j]),
                    (a, b) => a * b,
                    1
                );
                const index = Math.floor(finDifs[k].length / 2) - (1 - finDifs[k].length % 2);
                return sum + term * finDifs[k][index] / factorial(k);
            },
            0
        );
    };

    return (x: number) => (f1(x) + f2(x)) / 2;
}

function besselPolynomial(xs: number[], ys: number[], n: number): Polynomial {
    const alphaInd = Math.floor(n / 2);
    const finDifs: number[][] = [];
    finDifs.push([...ys]);

    for (let k = 1; k <= n; k++) {
        const last = [...finDifs[k - 1]];
        const newDif: number[] = [];
        for (let i = 0; i < n - k + 1; i++) {
            newDif.push(last[i + 1] - last[i]);
        }
        finDifs.push(newDif);
    }

    const h = xs[1] - xs[0];
    const dts1 = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5];

    return (x: number) => {
        return (ys[alphaInd] + ys[alphaInd]) / 2 + reduce<number>(
            Array.from({length: n}, (_, k) => k + 1),
            (sum, k) => {
                const term1 = reduce<number>(
                    Array.from({length: k}, (_, j) => (x - xs[alphaInd]) / h + dts1[j]),
                    (a, b) => a * b,
                    1
                ) * finDifs[k][Math.floor(finDifs[k].length / 2)] / factorial(2 * k);

                const term2 = ((x - xs[alphaInd]) / h - 0.5) *
                    reduce<number>(
                        Array.from({length: k}, (_, j) => (x - xs[alphaInd]) / h + dts1[j]),
                        (a, b) => a * b,
                        1
                    ) * finDifs[k][Math.floor(finDifs[k].length / 2)] / factorial(2 * k + 1);

                return sum + term1 + term2;
            },
            0
        );
    };
}

type InterpolationResult = {
  t: number
  result: number
  fn: Polynomial
  name: InterpolationMethod
}

export type SolutionData = {
  diffTable: number[][]
  interpolationPoint: number
  interpolations: InterpolationResult[]
  points: Point[]
}

enum InterpolationMethod {
  Lagrange = "Многочлен Лагранжа",
  NewtonDividedDifference = "Многочлен Ньютона с разделенными разностями",
  NewtonFiniteDifference = "Многочлен Ньютона с конечными разностями",
  Gauss = "Многочлен Гаусса",
  Stirling = "Многочлен Стирлинга",
  Bessel = "Многочлен Бесселя"
}

type InterpolationFunction = (xs: number[], ys: number[], n: number) => Polynomial

export function solve(points: Point[], x: number): SolutionData {
    const n = points.length
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)
    const deltaY = finiteDifferences(ys);

    const methods: Array<[InterpolationMethod, InterpolationFunction]> = [
        [InterpolationMethod.Lagrange, lagrangePolynomial],
        [InterpolationMethod.NewtonDividedDifference, newtonDividedDifferencePolynomial],
        [InterpolationMethod.NewtonFiniteDifference, newtonFiniteDifferencePolynomial],
        [InterpolationMethod.Gauss, gaussPolynomial],
        // [InterpolationMethod.Stirling, stirlingPolynomial],
        // [InterpolationMethod.Bessel, besselPolynomial]
    ];

    let finiteDifference = true;
    let last = xs[1] - xs[0];
    for (let i = 1; i < n; i++) {
        const newDiff = Math.abs(xs[i] - xs[i - 1]);
        if (Math.abs(newDiff - last) > 0.0001) {
            finiteDifference = false;
        }
        last = newDiff;
    }

    const h = xs[1] - xs[0];
    const alphaInd = Math.floor(n / 2);

    const interpolations = methods.reduce<InterpolationResult[]>((acc, [name, method]) => {
      if (method === newtonFiniteDifferencePolynomial && !finiteDifference) return acc;
      if (method === newtonDividedDifferencePolynomial && finiteDifference) return acc;
      if ((method === gaussPolynomial || method === stirlingPolynomial) && xs.length % 2 === 0) return acc;
      if (method === besselPolynomial && xs.length % 2 === 1) return acc;

      const t = (x - xs[alphaInd]) / h;

      const P = method(xs, ys, n);
      acc.push({
        result: P(x),
        fn: P,
        t,
        name
      })

      return acc
    }, [] as InterpolationResult[])

    return {
      diffTable: deltaY,
      interpolations,
      interpolationPoint: x,
      points: xs.map((x, ind) => [x, ys[ind]])
    }
}
