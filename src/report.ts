import { Board } from "./board";

function start() {
  var t0 = performance.now();
  return () => {
    var t1 = performance.now();
    return t1 - t0;
  };
}

export async function reportPerf() {
  async function runReport(
    width: number,
    height: number,
    count: number,
    renders: number
  ) {
    await new Promise((r) => setTimeout(r, 10));
    const board = new Board(width, height, count, "solid");
    const end = start();
    for (let i = 0; i < renders; i++) {
      board.update();
    }
    const res = end();
    console.log(
      `${width}x${height}: (${count} Pieces) ${renders} renders in ${res} milliseconds. ${
        res / renders
      }ms each render. Winner: ${board.winner}`
    );
  }
  await runReport(1200, 800, 1000, 500);
  await runReport(1200, 800, 1000, 100);
  await runReport(2400, 1200, 2000, 500);
  await runReport(400, 1000, 1000, 500);
  await runReport(1200, 800, 100, 1000);

  // async function runTilWin(width: number, height: number, count: number) {
  //   await new Promise((r) => setTimeout(r, 100));
  //   const board = new Board(width, height, count, "solid");
  //   let i = 0;
  //   const max = 10000;
  //   while (!board.winner) {
  //     i++;
  //     if (i > max) {
  //       console.log(`No winner after ${max} renders`);
  //       return;
  //     }
  //     board.update();
  //   }
  //   console.log(`Winner ${board.winner} after ${i} moves`);
  // }
  // for (let i = 0; i < 10; i++) {
  //   await runTilWin(550, 400, 500);
  // }
}
