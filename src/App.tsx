import { useMemo, useState } from "react";
import { Error, InputUploader, MultiGraph, Solution } from "./components";
import { ValidationError } from "./types.ts";
import { getPoints, solve, SolutionData, Point } from "./utils";
import clsx from "clsx";
import { predefinedFunctions } from "./constants.ts";

enum InputVariant {
  Points = "points",
  Function = "function"
}

export default function App() {
  const [pointsData, setPointsData] = useState("");

  const [error, setError] = useState<ValidationError>();
  const [solution, setSolution] = useState<SolutionData>();
  const [inputVariant, setInputVariant] = useState(InputVariant.Points);

  const [currentFunction, setCurrentFunction] = useState<string>();

  const [interpolationPoint, setInterpolationPoint] = useState(0);
  const [nodesCount, setNodesCount] = useState(2);
  const [intervalLeft, setIntervalLeft] = useState(0);
  const [intervalRight, setIntervalRight] = useState(0);

  const isDataValid = useMemo(() => {
    if (inputVariant === InputVariant.Points) {
      return !!pointsData && !isNaN(interpolationPoint);
    }

    return (
      intervalLeft < intervalRight &&
      intervalLeft < interpolationPoint &&
      interpolationPoint < intervalRight &&
      currentFunction &&
      nodesCount === Math.round(nodesCount)
    );
  }, [
    inputVariant,
    intervalLeft,
    intervalRight,
    currentFunction,
    pointsData,
    interpolationPoint,
    nodesCount,
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Function interpolation</h1>
      <div className="flex gap-x-6 items-start">
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-3 items-start">
            <div className="section">
              <div className="flex gap-x-1 items-start w-fit pb-1 border-b border-orange-400">
                <button
                  className={clsx(
                    "text-sm text-gray-800 hover:bg-orange-200 p-2 rounded",
                    inputVariant === InputVariant.Points && "bg-orange-300"
                  )}
                  onClick={() => setInputVariant(InputVariant.Points)}
                >
                  Points
                </button>
                <button
                  className={clsx(
                    "text-sm text-gray-800 hover:bg-orange-200 p-2 rounded",
                    inputVariant === InputVariant.Function && "bg-orange-300"
                  )}
                  onClick={() => setInputVariant(InputVariant.Function)}
                >
                  Function
                </button>
              </div>
              {inputVariant === InputVariant.Points ? (
                <div className="flex gap-x-3 items-start">
                  <div className="flex flex-col gap-y-3">
                    <h4 className="font-bold text-lg">Interpolation point</h4>
                    <input
                      type="number"
                      className="field"
                      name="interpolation-point"
                      value={interpolationPoint}
                      onChange={(event) =>
                        setInterpolationPoint(+event.target.value)
                      }
                    />

                    <h4 className="font-bold text-lg">Interpolation nodes</h4>
                    <textarea
                      className="field !w-32 !text-left"
                      value={pointsData}
                      onChange={(event) => setPointsData(event.target.value)}
                      placeholder="x1 y1
  x2 y2
  ...
  xn yn"
                    />
                  </div>

                  <InputUploader
                    setInterpolationPoint={setInterpolationPoint}
                    setPoints={setPointsData}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-y-2">
                  <h4 className="font-bold text-lg">Function</h4>
                  <select
                    value={currentFunction}
                    onChange={(event) => setCurrentFunction(event.target.value)}
                  >
                    <option value={undefined}>Choose function</option>
                    {predefinedFunctions.map(({ label }, index) => (
                      <option key={index} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <h4 className="font-bold text-lg">Interpolation point</h4>
                  <input
                    type="number"
                    className="field"
                    name="interpolation-point"
                    value={interpolationPoint}
                    onChange={(event) =>
                      setInterpolationPoint(+event.target.value)
                    }
                  />
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
                      onChange={(event) =>
                        setIntervalRight(+event.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-default"
              disabled={!isDataValid}
              onClick={() => {
                if (!isDataValid) return;
                setError(undefined);
                setSolution(undefined);
                let points: Point[] | null;
                if (inputVariant === InputVariant.Points) {
                  points = getPoints(pointsData);
                } else {
                  const h = (intervalRight - intervalLeft) / nodesCount;
                  const inputFunction = predefinedFunctions.find(
                    ({ label }) => label === currentFunction
                  )!.equation;
                  points = Array.from({ length: nodesCount + 1 }).map(
                    (_, index) => {
                      const x = intervalLeft + h * index;
                      return [x, inputFunction(x)];
                    }
                  );
                }
                if (!points) {
                  setError(ValidationError.invalidPoints);
                  return;
                }
                if (points.slice(1).some((point, i) => point <= points[i])) {
                  setError(ValidationError.notAscendingPoints);
                  return;
                }
                const result = solve(points, interpolationPoint);

                setSolution(result);
              }}
            >
              Find solution
            </button>
            {solution && <MultiGraph solution={solution} />}
          </div>
        </div>
      </div>

      {solution && <Solution solution={solution} />}
      {error && <Error error={error} />}
    </div>
  );
}
