export type Vector2 = [x: number, y: number];
export type Vector3 = [x: number, y: number, z: number];

const Vec2 = {
  new: (): Vector2 => [0, 0],
  getDistance: (p1: Vector2, p2: Vector2) =>
    Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2)),
  getSquareDistance: (p1: Vector2, p2: Vector2) =>
    Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2),
  normalize: (p: Vector2): Vector2 => {
    var length = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    return [p[0] / length || 0, p[1] / length || 0];
  },
  round: (p: Vector2) => [Math.round(p[0]), Math.round(p[1])],
  difference: (p1: Vector2, p2: Vector2): Vector2 => [
    p1[0] - p2[0],
    p1[1] - p2[1],
  ],
  addition: (p1: Vector2, p2: Vector2): Vector2 => [
    p1[0] + p2[0],
    p1[1] + p2[1],
  ],
  product: (p1: Vector2, p2: Vector2): Vector2 => [
    p1[0] * p2[0],
    p1[1] * p2[1],
  ],
  multiply: (p: Vector2, multiple: number): Vector2 => [
    p[0] * multiple,
    p[1] * multiple,
  ],
  mutAddition: (p1: Vector2, p2: Vector2) => {
    p1[0] += p2[0];
    p1[1] += p2[1];
  },
  mutMultiply: (p: Vector2, multiple: number) => {
    p[0] *= multiple;
    p[1] *= multiple;
  },
  mutRound: (p: Vector2) => {
    p[0] = Math.round(p[0]);
    p[1] = Math.round(p[1]);
  },
};

// const Vec3 = {
//   new: (): Vector3 => [0, 0, 0],
//   getDistance: (p1: Vector3, p2: Vector3) =>
//     Math.sqrt(
//       Math.pow(p1[0] - p2[0], 2) +
//         Math.pow(p1[1] - p2[1], 2) +
//         Math.pow(p1[0] - p2[0], 2)
//     ),
//   getSquareDistance: (p1: Vector3, p2: Vector3) =>
//     Math.pow(p1[0] - p2[0], 2) +
//     Math.pow(p1[1] - p2[1], 2) +
//     Math.pow(p1[0] - p2[0], 2),
//   normalize: (p: Vector3): Vector3 => {
//     var length = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
//     return [p[0] / length || 0, p[1] / length || 0, p[2] / length || 0];
//   },
//   difference: (p1: Vector3, p2: Vector3): Vector3 => [
//     p1[0] - p2[0],
//     p1[1] - p2[1],
//     p1[2] - p2[2],
//   ],
//   addition: (p1: Vector3, p2: Vector3): Vector3 => [
//     p1[0] + p2[0],
//     p1[1] + p2[1],
//     p1[2] + p2[2],
//   ],
//   multiply: (p: Vector3, multiple: number): Vector3 => [
//     p[0] * multiple,
//     p[1] * multiple,
//     p[2] * multiple,
//   ],
// };

const Vec = Vec2;

export type Point = Vector2;

export const newPoint = Vec.new;
export const getDistance = Vec.getDistance;
export const getSquareDistance = Vec.getSquareDistance;
export const normalize = Vec.normalize;
export const difference = Vec.difference;
export const addition = Vec.addition;
export const multiply = Vec.multiply;
export const mutAddition = Vec.mutAddition;
export const mutMultiply = Vec.mutMultiply;
export const round = Vec.round;
export const mutRound = Vec.mutRound;
export const product = Vec.product;
