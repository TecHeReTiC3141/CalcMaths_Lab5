import { useMemo, useState } from 'react'
import { Error, InputUploader, Solution } from "./components";
import { ValidationError } from "./types.ts";
import { ApproximationResult, getApproximations, getPoints } from "./utils";

export default function App() {
  const [ pointsData, setPointsData ] = useState('');

  const [ error, setError ] = useState<ValidationError>();
  const [ solution, setSolution ] = useState<ApproximationResult[]>();

  const isDataValid = useMemo(() => {
    return !!(pointsData)
  }, [ pointsData ])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Function approximation</h1>
      <div className="flex gap-x-6 items-start">
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-3">
              <div className="flex flex-col gap-y-3 section">
                <h3 className="text-lg mb-1 font-bold">Data</h3>
                <div className="flex gap-x-3 items-stretch">
                  <textarea className="field !w-32 !text-left" value={pointsData} onChange={event => setPointsData(event.target.value)} placeholder="x1 y1
x2 y2
...
xn yn"/>
                    <InputUploader setPoints={setPointsData} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-3 items-start">
            <button
              className="btn disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-default"
              disabled={!isDataValid}
              onClick={() => {
                if (!isDataValid) return
                setError(undefined)
                setSolution(undefined)
                const points = getPoints(pointsData)
                if (!points) {
                  setError(ValidationError.invalidPoints)
                  return
                }
                const result = getApproximations(points)


                setSolution(result)
              }}
            >
              Find solution
            </button>
          </div>
        </div>
      </div>

      {solution && <Solution solution={solution}/>}
      {error && <Error error={error}/>}
    </div>
  );
};


