import { ODE } from "./types";

export const predefinedOdes: ODE[] = [
  {
    f: (x, y) => y + (1 + x) * y ** 2,
    exactY: (x, x0, y0) =>
      -Math.exp(x) /
      (x * Math.exp(x) - (x0 * Math.exp(x0) * y0 + Math.exp(x0)) / y0),
    label: "y' = y + (1 + x) * y²",
  },
  {
    f: (x, y) => x + y,
    exactY: (x, x0, y0) => Math.exp(x - x0) * (y0 + x0 + 1) - x - 1,
    label: "y' = x + y",
  },
  {
    f: (x, y) => Math.sin(x) - y,
    exactY: (x, x0, y0) =>
      (2 * Math.exp(x0) * y0 -
        Math.exp(x0) * Math.sin(x0) +
        Math.exp(x0) * Math.cos(x0)) /
        (2 * Math.exp(x)) +
      Math.sin(x) / 2 -
      Math.cos(x) / 2,
    label: "y' = sin(x) - y",
  },
  {
    f: (x, y) => y / x,
    exactY: (x, x0, y0) => (x * y0) / x0,
    label: "y' = y / x (x ≠ 0)",
  },
  {
    f: (x, y) => Math.exp(x),
    exactY: (x, x0, y0) => y0 - Math.exp(x0) + Math.exp(x),
    label: "y' = exp(x)",
  },
];

export const INITIAL_SEGMENTS = 4;
export const SEGMENTS = 10000;
