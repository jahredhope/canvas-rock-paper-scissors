export type Point = [x: number, y: number];

export const getDistance = (p1: Point, p2: Point) =>
  Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));

export const normalize = (p: Point): Point => {
  var length = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
  return [p[0] / length || 0, (p[1] = p[1] / length || 0)];
};
export const difference = (p1: Point, p2: Point): Point => [
  p1[0] - p2[0],
  p1[1] - p2[1],
];
export const addition = (p1: Point, p2: Point): Point => [
  p1[0] + p2[0],
  p1[1] + p2[1],
];
export const multiply = (p: Point, multiple: number): Point => [
  p[0] * multiple,
  p[1] * multiple,
];
