export interface Point {
  x: number;
  y: number;
}

export const getDistance = (p1: Point, p2: Point) =>
  Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

export const normalize = (p: Point): Point => {
  var length = Math.sqrt(p.x * p.x + p.y * p.y);
  return { x: p.x / length || 0, y: (p.y = p.y / length || 0) };
};
// const reverse = (p: Point): Point => {
//   return { x: -p.x, y: -p.y };
// };
export const difference = (p1: Point, p2: Point): Point => ({
  x: p1.x - p2.x,
  y: p1.y - p2.y,
});
export const addition = (p1: Point, p2: Point): Point => ({
  x: p1.x + p2.x,
  y: p1.y + p2.y,
});
export const multiply = (p: Point, multiple: number): Point => ({
  x: p.x * multiple,
  y: p.y * multiple,
});
