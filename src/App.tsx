import { useMemo, useState } from "react";
import { Error, MultiGraph, Solution } from "./components";
import { ValidationError } from "./types.ts";
import { solve, SolutionData } from "./utils";
import { predefinedOdes } from "./constants.ts";

export default function App() {
  const [error, setError] = useState<ValidationError>();
  const [solution, setSolution] = useState<SolutionData>();

  const [currentFunction, setCurrentFunction] = useState<string>();

  const [nodesCount, setNodesCount] = useState(10);
  const [intervalLeft, setIntervalLeft] = useState(0);
  const [intervalRight, setIntervalRight] = useState(0);
  const [y0, setY0] = useState(0);
  const [accuracy, setAccuracy] = useState(0.001);

  const isDataValid = useMemo(() => {
    return (
      intervalLeft < intervalRight &&
      currentFunction &&
      nodesCount === Math.round(nodesCount)
    );
  }, [intervalLeft, intervalRight, currentFunction, nodesCount]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solving ODEs</h1>
      <div className="flex gap-x-6 items-start">
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-3 items-start">
            <div className="section">
              <div className="flex flex-col gap-y-3">
                <h4 className="font-bold text-lg">Function</h4>
                <select
                  value={currentFunction}
                  onChange={(event) => setCurrentFunction(event.target.value)}
                >
                  <option value={undefined}>Choose function</option>
                  {predefinedOdes.map(({ label }, index) => (
                    <option key={index} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <h4 className="font-bold text-lg">Y0</h4>
                <input
                  type="number"
                  className="field"
                  name="interpolation-point"
                  value={y0}
                  onChange={(event) => setY0(+event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <h4 className="font-bold text-lg">Interval</h4>
                <div className="flex gap-x-2 items-center">
                  <input
                    type="number"
                    className="field"
                    name="interpolation-point"
                    value={intervalLeft}
                    onChange={(event) => setIntervalLeft(+event.target.value)}
                  />
                  <p>:</p>
                  <input
                    type="number"
                    className="field"
                    name="interpolation-point"
                    value={intervalRight}
                    onChange={(event) => setIntervalRight(+event.target.value)}
                  />
                </div>
                <h4 className="font-bold text-lg">Nodes count</h4>
                <input
                  type="number"
                  min="2"
                  step="1"
                  pattern="\d+"
                  className="field"
                  name="interpolation-point"
                  value={nodesCount}
                  onChange={(event) => setNodesCount(+event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-2">
              <div>
                <h4 className="font-bold text-lg">Accuracy</h4>
                <input
                  type="number"
                  min="2"
                  step="1"
                  pattern="\d+"
                  className="field"
                  name="accuracy"
                  value={accuracy}
                  onChange={(event) => setAccuracy(+event.target.value)}
                />
              </div>

              <button
                className="btn disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-default"
                disabled={!isDataValid}
                onClick={() => {
                  if (!isDataValid) return;
                  setError(undefined);
                  setSolution(undefined);
                  const { f, exactY } = predefinedOdes.find(
                    ({ label }) => label === currentFunction
                  )!;
                  const result = solve(
                    f,
                    exactY,
                    intervalLeft,
                    intervalRight,
                    nodesCount,
                    y0,
                    accuracy
                  );

                  setSolution(result);
                }}
              >
                Find solution
              </button>
            </div>
            {solution && <MultiGraph solution={solution} />}
          </div>
        </div>
      </div>

      {solution && <Solution solution={solution} />}
      {error && <Error error={error} />}
    </div>
  );
}
