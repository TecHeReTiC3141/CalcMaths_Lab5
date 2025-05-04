import { SolutionData } from "../utils";
import { DiffTable } from "./DiffTable";

type SolutionProps = {
    solution: SolutionData
}

export function Solution ({ solution }: SolutionProps) {

  return (
    <div className="p-6 section rounded-xl shadow-md mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Approximation functions</h2>
        <DiffTable deltaY={solution.diffTable} />
        {solution.interpolations.map((result, index) => (
          <div key={`interpolation-fn-${index}`} className="border-b-2 border-gray-700 mb-4 last:border-b-0">
            <h4 className="font-bold text-lg">{result.name} функция:</h4>
            <p>t = {result.t}</p>
            <p>P({solution.interpolationPoint}) = {result.fn(solution.interpolationPoint)}</p>
          </div>
        ))}
    </div>
  );
};
