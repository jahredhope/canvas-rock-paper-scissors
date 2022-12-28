import { Board } from "./board";
import { getInitialState, setupFPS } from "./state";
import { setupUI } from "./ui";

export async function playGame() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Unable to find canvas");
  }

  canvas.width = document.body.scrollWidth;
  canvas.height = document.body.scrollHeight;

  const initialState = getInitialState(canvas);

  let ctx = canvas.getContext("2d")!;

  const board = await Board.createBoard(initialState);

  let requestedAnimationFrame: null | number = null;

  setupFPS(board);
  setupUI(board, canvas, play);

  function play() {
    if (requestedAnimationFrame) {
      window.cancelAnimationFrame(requestedAnimationFrame);
    }
    requestAnimationFrame(loop);
  }

  function loop() {
    // Prepare
    board.state.renderCount++;
    requestedAnimationFrame = null;
    if (board.state.playing === false) return;

    // Update
    if (board.state.playing && !board.winner) {
      board.update();
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.renderPieces(ctx, canvas);

    if (!board.state.hideUI) {
      if (board.winner) board.renderWinner(ctx, canvas);
      if (board.state.speed > 1) board.renderFast(ctx, canvas);
      if (!board.state.playing && !board.winner)
        board.renderPaused(ctx, canvas);

      board.renderScores(ctx, canvas);
    }

    // Repeat
    if (requestedAnimationFrame === null)
      requestedAnimationFrame = requestAnimationFrame(loop);
  }

  play();
}
