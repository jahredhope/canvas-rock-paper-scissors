import { Board } from "../src/board";

async function setup() {
  const state = {
    height: 1000,
    width: 1800,
    depth: 200,
    maxItems: 2000,
    autoSize: false,
    hideUI: false,
    renderCount: 0,
    fps: 0,
    lastScale: 1,
    playing: true,
    seed: "HBFKLUNDULSY",
    speed: 1,
    activeIndex: -1,
  };
  const board = await Board.createBoard(state);
  return board;
}

async function run() {
  const board = await setup();
  console.log("Created board. Running till completion");
  console.time("Run Game");
  let timeTotal = 0;
  let timeFrame = 0;

  for (let i = 0; true; i++) {
    if (i > 2000) {
      console.log("Over");
      break;
    }
    if (board.winner) {
      console.log(`Winner in ${i} steps`);
      break;
    }
    if (i % 240 === 0) {
      console.log(
        `Running step ${i}. ${(timeFrame / 240).toFixed(2)}ms per step. (Avg ${(
          timeTotal / i
        ).toFixed(2)}ms)`
      );
      timeFrame = 0;
      await new Promise((r) => setTimeout(r, 20));
    }
    const t1 = performance.now();
    board.update();
    const t2 = performance.now();
    const time = t2 - t1;
    timeTotal += time;
    timeFrame += time;
  }
  console.timeEnd("Run Game");

  console.log("Done");
}

export const reportPerf = run;
