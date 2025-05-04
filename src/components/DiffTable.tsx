import React from 'react';

interface DiffTableProps {
  deltaY: number[][];
}

export const DiffTable: React.FC<DiffTableProps> = ({ deltaY }) => {
  if (!deltaY || deltaY.length === 0) return <div>No data available</div>;

  const n = deltaY.length;

  // Генерируем заголовки столбцов (Δy, Δ²y, Δ³y, ...)
  const headers = ['y', ...Array.from({ length: n - 1 }, (_, i) => `Δ^${i + 1}y`)];

  return (
    <div className="my-5 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">Таблица конечных разностей</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-orange-100">
            {headers.map((header, index) => (
              <th 
                key={index}
                className="p-2 border border-orange-300 font-medium text-center"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deltaY.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className="hover:bg-orange-200  even:bg-orange-100"
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  className="p-2 border-orange-300 border text-center"
                >
                  {rowIndex + cellIndex < n ? cell.toFixed(4) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
