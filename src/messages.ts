import { Item, RenderPiece } from "./render-piece";
import { Point } from "./point";

export interface ActiveItem {
  dir: Point;
  pos: Point;
  prey: Point | null;
  preyForce: Point | null;
  predator: Point | null;
  predatorForce: Point | null;
  size: number;
}

export type ParentMessage =
  | {
      type: "initialize";
      pieces: RenderPiece[];
      width: number;
      height: number;
      targetFrameRate: number;
      speed: number;
      size: number;
      playing: boolean;
      index: number;
    }
  | { type: "add-piece"; point: Point; item: Item }
  | { type: "set-speed"; speed: number }
  | { type: "set-size"; height: number; width: number }
  | { type: "set-active"; index: number }
  | { type: "set-framerate"; rate: number }
  | { type: "pause" };

export type UpdateMessage = {
  type: "update";
  active?: ActiveItem;
  winner?: Item;
  arr: Uint16Array;
  stats: Record<Item, number>;
};
export type WorkerMessage = UpdateMessage;
