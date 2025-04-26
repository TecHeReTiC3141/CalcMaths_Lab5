type Matrix2D = number[][];

function calcDet2(A: Matrix2D): number {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

function solve2(A: Matrix2D, B: number[]): [number, number] {
  const det = calcDet2(A);
  const det1 = calcDet2([[B[0], A[0][1]], [B[1], A[1][1]]]);
  const det2 = calcDet2([[A[0][0], B[0]], [A[1][0], B[1]]]);
  const x1 = det1 / det;
  const x2 = det2 / det;
  return [x1, x2];
}

function calcDet3(A: Matrix2D): number {
  const pos = A[0][0] * A[1][1] * A[2][2] +
    A[0][1] * A[1][2] * A[2][0] +
    A[0][2] * A[1][0] * A[2][1];
  const neg = A[0][2] * A[1][1] * A[2][0] +
    A[0][1] * A[1][0] * A[2][2] +
    A[0][0] * A[1][2] * A[2][1];
  return pos - neg;
}

function solve3(A: Matrix2D, B: number[]): [number, number, number] {
  const det = calcDet3(A);
  const det1 = calcDet3([[B[0], A[0][1], A[0][2]], [B[1], A[1][1], A[1][2]], [B[2], A[2][1], A[2][2]]]);
  const det2 = calcDet3([[A[0][0], B[0], A[0][2]], [A[1][0], B[1], A[1][2]], [A[2][0], B[2], A[2][2]]]);
  const det3 = calcDet3([[A[0][0], A[0][1], B[0]], [A[1][0], A[1][1], B[1]], [A[2][0], A[2][1], B[2]]]);
  const x1 = det1 / det;
  const x2 = det2 / det;
  const x3 = det3 / det;
  return [x1, x2, x3];
}

function calcDet4(A: Matrix2D): number {
  const n = 4;
  let sign = 1;
  const r = 0;
  let res = 0;
  for (let c = 0; c < n; c++) {
    const A_: Matrix2D = [];
    for (let r_ = 0; r_ < n; r_++) {
      if (r_ !== r) {
        const row: number[] = [];
        for (let c_ = 0; c_ < n; c_++) {
          if (c_ !== c) {
            row.push(A[r_][c_]);
          }
        }
        A_.push(row);
      }
    }
    res += sign * A[r][c] * calcDet3(A_);
    sign *= -1;
  }
  return res;
}

function solve4(A: Matrix2D, B: number[]): [number, number, number, number] {
  const n = 4;
  const det = calcDet4(A);
  const det1 = calcDet4([[B[0], A[0][1], A[0][2], A[0][3]], [B[1], A[1][1], A[1][2], A[1][3]], [B[2], A[2][1], A[2][2], A[2][3]], [B[3], A[3][1], A[3][2], A[3][3]]]);
  const det2 = calcDet4([[A[0][0], B[0], A[0][2], A[0][3]], [A[1][0], B[1], A[1][2], A[1][3]], [A[2][0], B[2], A[2][2], A[2][3]], [A[3][0], B[3], A[3][2], A[3][3]]]);
  const det3 = calcDet4([[A[0][0], A[0][1], B[0], A[0][3]], [A[1][0], A[1][1], B[1], A[1][3]], [A[2][0], A[2][1], B[2], A[2][3]], [A[3][0], A[3][1], B[3], A[3][3]]]);
  const det4 = calcDet4([[A[0][0], A[0][1], A[0][2], B[0]], [A[1][0], A[1][1], A[1][2], B[1]], [A[2][0], A[2][1], A[2][2], B[2]], [A[3][0], A[3][1], A[3][2], B[3]]]);
  const x1 = det1 / det;
  const x2 = det2 / det;
  const x3 = det3 / det;
  const x4 = det4 / det;
  return [x1, x2, x3, x4];
}

function solveSLE(A: Matrix2D, B: number[], n: number): number[] | null {
  switch (n) {
    case 2:
      return solve2(A, B);
    case 3:
      return solve3(A, B);
    case 4:
      return solve4(A, B);
    default:
      console.log(`! n should be 2/3/4, ${n} got`);
      return null;
  }
}