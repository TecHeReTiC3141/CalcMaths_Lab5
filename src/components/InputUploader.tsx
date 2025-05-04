import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

type Props = {
    setInterpolationPoint: Dispatch<SetStateAction<number>>
    setPoints: Dispatch<SetStateAction<string>>
}

export function InputUploader({ setPoints, setInterpolationPoint }: Props) {
    const [ error, setError ] = useState<string | null>(null);

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        setError(null)
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const [interpolationPoint, ...lines] = content.split("\n").map(line => line.trim()).filter((line) => line)

            if (isNaN(+interpolationPoint) || lines.some((line) => {
                const [x, y] = line.split(' ').map((val) => +val)
                return isNaN(x) || isNaN(y)
            })) { 
                setError("Incorrect format")
                return
            }
            setInterpolationPoint(+interpolationPoint)
            setPoints(lines.join('\n'))
        };
        reader.readAsText(file);
    };

    return (
        <div className="section relative">
            <h3 className="text-lg font-bold">Upload file</h3>
            <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="mt-2 border p-1"
            />
            <p className="font-bold">Input Format</p>
            <pre>x</pre>
            <pre>x1 y1</pre>
            <pre>x2 y2</pre>
            <pre>...</pre>
            <pre>xn yn</pre>
            { error && <p className="text-lg text-red-500 font-bold">{error}</p>}
        </div>
    )
}