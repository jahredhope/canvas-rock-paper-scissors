// import { Board } from "./board.ts.old";

import { getRandomSeed } from "./random";
import { Item } from "./render-piece";

export interface State {
  playing: boolean;
  height: number;
  width: number;
  depth: number;
  seed: string;
  fps: number;
  renderCount: number;
  size: number;
  speed: number;
  items: number;
  activeIndex: number;
  hideUI: boolean;
  winner: Item | null;
  rate: number;
  hide: boolean;
  mode: "click-to-place" | "click-to-debug";
  stats: Record<Item, number>;
  pieceToPlace: Item;
  lockSeed: boolean;
}

export function getInitialState(): State {
  let params = new URL(window.location.toString()).searchParams;
  const rHeight = Number.parseInt(params.get("height") || "") || null;
  const rWidth = Number.parseInt(params.get("width") || "") || null;
  const rMaxItems =
    params.has("items") &&
    !Number.isNaN(Number.parseInt(params.get("items") || ""))
      ? Number.parseInt(params.get("items") || "")
      : null;

  const rate = Number.parseInt(params.get("rate") || "") || 60;
  const active = params.has("active")
    ? Number.parseInt(params.get("active") || "")
    : -1;
  const hide = params.has("hide") ? true : false;
  const paused = params.has("paused") ? true : false;
  const lockSeed = params.get("seed") ? true : false;
  const seed = params.get("seed")?.toUpperCase() || getRandomSeed();

  const height = !rHeight ? document.body.scrollHeight : rHeight;
  const width = !rWidth ? document.body.scrollWidth : rWidth;
  const items = rMaxItems ?? Math.min(Math.ceil(height * width * 0.0003), 600);

  const maxDimension = Math.max(height, width);

  const speed =
    Number.parseInt(params.get("speed") || "") ||
    Math.ceil(maxDimension / 1000);
  const size =
    Number.parseInt(params.get("size") || "") ||
    Math.ceil(maxDimension / 400) + 6;

  return {
    height,
    width,
    depth: 200,
    hideUI: false,
    items,
    renderCount: 0,
    fps: 0,
    playing: !paused,
    seed,
    lockSeed,
    rate,
    speed,
    hide,
    size,
    activeIndex: active,
    winner: null,
    mode: "click-to-debug",
    pieceToPlace: 0,
    stats: {
      0: 0,
      1: 0,
      2: 0,
    },
  };
}
