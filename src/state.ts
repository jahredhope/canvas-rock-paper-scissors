// import { Board } from "./board.ts.old";

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
  stats: Record<Item, number>;
}

function getRandomSeed() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < 12; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

export function getInitialState(): State {
  let params = new URL(window.location.toString()).searchParams;
  const rHeight = Number.parseInt(params.get("height") || "") || null;
  const rWidth = Number.parseInt(params.get("width") || "") || null;
  const rMaxItems = Number.parseInt(params.get("items") || "") || null;

  const rate = Number.parseInt(params.get("rate") || "") || 60;
  const paused = params.has("paused") ? true : false;
  const seed = params.get("seed")?.toUpperCase() || getRandomSeed();

  const height = !rHeight ? document.body.scrollHeight : rHeight;
  const width = !rWidth ? document.body.scrollWidth : rWidth;
  const items = rMaxItems || Math.min(Math.ceil(height * width * 0.0004), 600);

  const maxDimension = Math.max(height, width);

  const speed =
    Number.parseInt(params.get("speed") || "") ||
    Math.ceil(maxDimension / 1000);
  const size =
    Number.parseInt(params.get("size") || "") ||
    Math.ceil(maxDimension / 400) + 5;

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
    rate,
    speed,
    size,
    activeIndex: -1,
    winner: null,
    stats: {
      0: 0,
      1: 0,
      2: 0,
    },
  };
}
