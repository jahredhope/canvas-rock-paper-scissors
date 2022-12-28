import { Board, State } from "./board";

function getRandomSeed() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < 12; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

export function getInitialState(canvas: HTMLCanvasElement): State {
  let params = new URL(window.location.toString()).searchParams;
  const rHeight = Number.parseInt(params.get("height") || "") || null;
  const rWidth = Number.parseInt(params.get("width") || "") || null;
  const rMaxItems = Number.parseInt(params.get("items") || "") || null;

  const autoSize = params.get("autosize") === "true" || (!rHeight && !rWidth);
  const speed = Number.parseInt(params.get("speed") || "") || 1;
  const seed = params.get("seed")?.toUpperCase() || getRandomSeed();

  const height = !rHeight || autoSize ? canvas.height : rHeight;
  const width = !rWidth || autoSize ? canvas.width : rWidth;
  const maxItems =
    rMaxItems || Math.min(Math.ceil(height * width * 0.0004), 600);

  if (height < 100 || width < 100) {
    console.error("Something went wrong");
    console.error({
      rHeight,
      rWidth,
      rMaxItems,
      autoSize,
      height,
      width,
      maxItems,
      ch: canvas.height,
      cw: canvas.width,
      dh: document.body.scrollHeight,
      dw: document.body.scrollWidth,
    });
  }

  return {
    height,
    width,
    depth: 200,
    hideUI: false,
    maxItems,
    autoSize,
    renderCount: 0,
    fps: 0,
    lastScale: 1,
    playing: true,
    seed,
    speed,
    activeIndex: -1,
  };
}

export function setupFPS(board: Board) {
  setInterval(() => {
    board.state.fps = board.state.renderCount;
    board.state.renderCount = 0;
  }, 1000);
}
