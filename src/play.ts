// import { Board } from "./board.ts.old";
import { ActiveItem, ParentMessage, WorkerMessage } from "./messages";
import { drawActive, Item, drawPiece, RenderPiece } from "./render-piece";
import { createSeed, srand } from "./random";
import { createRate } from "./rate";
import { getInitialState } from "./state";
import { setupUI } from "./ui";
import { Board, mapPieceToName } from "./render-board";
import { getSquareDistance, Point, product } from "./point";

export async function playGame(worker: Worker) {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Unable to find canvas");
  }
  const scoresCanvas = document.getElementById(
    "canvas-scores"
  ) as HTMLCanvasElement;
  if (!scoresCanvas) {
    throw new Error("Unable to find canvas");
  }
  scoresCanvas.width = 120;
  scoresCanvas.height = 120;

  const state = getInitialState();
  let pieces: RenderPiece[] = [];

  async function initialize() {
    canvas.width = state.width;
    canvas.height = state.height;
    const seed = await createSeed(state.seed);
    const rand = srand(seed);

    state.winner = null;

    (document.getElementById("dialog") as HTMLDivElement).classList.add("hide");

    pieces = [];

    function addRandom(item: Item) {
      rand.next().value;
      pieces.push({
        item,
        pos: [
          Math.floor(rand.next().value * state.width),
          Math.floor(rand.next().value * state.height),
        ],
      });
    }
    for (let i = 0; i < state.items; i += 3) {
      addRandom(Item.paper);
      addRandom(Item.scissor);
      addRandom(Item.rock);
    }

    worker.postMessage({
      type: "initialize",
      pieces,
      width: state.width,
      height: state.height,
      targetFrameRate: state.rate,
      speed: state.speed,
      size: state.size,
      playing: state.playing,
    } as ParentMessage);
  }
  await initialize();

  let ctx = canvas.getContext("2d")!;
  let scoresCtx = scoresCanvas.getContext("2d")!;

  let requestedAnimationFrame: null | number = null;

  setupUI(
    state,
    canvas,
    play,
    (message: ParentMessage) => {
      worker.postMessage(message);
    },
    selectPoint,
    initialize
  );

  function selectPoint(p: Point) {
    if (!latestState) return;

    const pointOnCanvas = product(p, [state.width, state.height]);

    if (state.mode === "click-to-debug") {
      let closestIndex: number = -1;
      let shortestDistance = 50 * 50;

      for (let i = 0; i < pieces.length; i++) {
        const distance = getSquareDistance(pointOnCanvas, [
          latestState[i * 3 + 1],
          latestState[i * 3 + 2],
        ]);
        if (distance < shortestDistance) {
          closestIndex = i;
          shortestDistance = distance;
        }
      }
      state.activeIndex = closestIndex;
      worker.postMessage({ type: "set-active", index: state.activeIndex });
    }
    if (state.mode === "click-to-place") {
      console.log("Adding item", state.pieceToPlace);
      pieces.push({ item: state.pieceToPlace, pos: pointOnCanvas });
      worker.postMessage({
        type: "add-piece",
        point: pointOnCanvas,
        item: state.pieceToPlace,
      } as ParentMessage);
      state.mode = "click-to-debug";
    }
  }

  const drawCounter = createRate((v) => {
    (document.getElementById("dps-value") as HTMLSpanElement).innerHTML =
      v.toString();
  });
  const updateCounter = createRate((v) => {
    (document.getElementById("ups-value") as HTMLSpanElement).innerHTML =
      v.toString();
  });
  const renderCounter = createRate((v) => {
    (document.getElementById("fps-value") as HTMLSpanElement).innerHTML =
      v.toString();
  });

  let hasUpdate = true;
  let pendingRender = false;
  let latestState: Uint16Array | null = null;
  let activeItem: ActiveItem | null = null;
  worker.addEventListener("message", (message: MessageEvent<WorkerMessage>) => {
    if (message.data.type === "update") {
      updateCounter();
      hasUpdate = true;
      state.stats = message.data.stats;
      latestState = message.data.arr;
      activeItem = message.data.active || null;
      state.winner = message.data.winner ?? null;
      if (state.winner !== null) {
        (document.getElementById("dialog") as HTMLDivElement).classList.remove(
          "hide"
        );
        (document.getElementById("winner") as HTMLSpanElement).innerHTML =
          mapPieceToName[state.winner].toString();
      }
      if (pendingRender) {
        loop();
      } else {
        play();
      }
    }
  });

  function play() {
    if (!requestedAnimationFrame) loop();
  }

  const board = new Board(state);

  function render() {
    renderCounter();
    loop();
  }

  function loop() {
    if (!latestState || !hasUpdate) {
      pendingRender = true;
      return;
    }

    // Prepare
    drawCounter();
    pendingRender = false;
    hasUpdate = false;
    requestedAnimationFrame = null;

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scoresCtx.clearRect(0, 0, scoresCanvas.width, scoresCanvas.height);

    if (activeItem) drawActive(ctx, activeItem);

    for (let i = 0; i < pieces.length && i < latestState.length * 3 + 2; i++) {
      const type = latestState[i * 3 + 0];
      const x = latestState[i * 3 + 1];
      const y = latestState[i * 3 + 2];
      drawPiece(ctx, x, y, type, state.size);
    }

    if (!state.hide) {
      if (!state.playing && state.winner === null)
        board.renderPaused(ctx, canvas);

      board.renderScores(scoresCtx, scoresCanvas, state.stats);
    }

    // Repeat
    if (requestedAnimationFrame === null && state.playing === true)
      requestedAnimationFrame = requestAnimationFrame(render);
  }

  loop();
}
