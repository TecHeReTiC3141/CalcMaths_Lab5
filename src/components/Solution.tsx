import { SolutionData } from "../utils";

type SolutionProps = {
  solution: SolutionData;
};

export function Solution({ solution }: SolutionProps) {
  return (
    <div className="p-6 section rounded-xl shadow-md mt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Solutions</h2>
      {solution.results.map((result, index) => (
        <div
          key={`interpolation-fn-${index}`}
          className="border-b-2 border-gray-700 mb-4 last:border-b-0"
        >
          <h4 className="font-bold text-lg">{result.name}:</h4>
          <p>
            Для точности eps={solution.accuracy} интервал был разбит на n=
            {result.divCount} частей с шагом h={result.h} за {result.iters}{" "}
            итераций.
          </p>
          <p>
            <span className="font-bold">y:</span> [{" "}
            {result.ys.map((y) => y.toFixed(5)).join(", ")} ]
          </p>
          <p>
            <span className="font-bold">y_exact:</span> [{" "}
            {result.exactY.map((y) => y.toFixed(5)).join(", ")} ]
          </p>
          <p>
            {result.name === "Метод Адамса-Бэшфорта"
              ? `Погрешность (max|y_iточн - y_i|): ${result.inaccuracy}`
              : `Погрешность (по правилу Рунге): ${result.inaccuracy}`}
          </p>
        </div>
      ))}
    </div>
  );
}
