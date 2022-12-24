import { Board } from "./board";

export function playGame() {
  const countInput = document.getElementById("count") as HTMLInputElement;
  const pauseButton = document.getElementById("pause") as HTMLButtonElement;
  const resetButton = document.getElementById("reset") as HTMLButtonElement;
  const fastForwardButton = document.getElementById(
    "fast"
  ) as HTMLButtonElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Unable to find canvas");
  }
  let lastScale = 1;
  canvas.onclick = (e) => {
    board.selectPoint([e.clientX / lastScale, e.clientY / lastScale]);
  };

  function onChangeCount() {
    const value = Number.parseInt(countInput.value);
    if (value) board.changeCount(value);
  }
  countInput.onchange = onChangeCount;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;

  fastForwardButton.onclick = () => {
    board.speed = board.speed === 1 ? 3 : 1;
  };

  let ctx = canvas.getContext("2d")!;

  canvas.width = document.body.scrollWidth;
  canvas.height = document.body.scrollHeight;

  const autoSize = true;

  const boardHeight = autoSize ? canvas.height : 500;
  const boardWidth = autoSize ? canvas.width : 500;

  const _maxItems = Math.min(Math.ceil(boardHeight * boardWidth * 0.0004), 600);
  countInput.value = _maxItems.toString();
  const board = new Board(boardHeight, boardWidth, _maxItems, "solid", 123);

  function onResize() {
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;

    if (autoSize) {
      board.changeSize(canvas.width, canvas.height);
    }
  }

  window.onresize = onResize;

  board.reset();

  function onPause() {
    playing = !playing;
    if (playing) play();
  }

  function onReset() {
    board.reset();
  }

  pauseButton.onclick = onPause;
  resetButton.onclick = onReset;

  let playing = true;
  window.onkeyup = (e) => {
    if (e.key === " ") {
      onPause();
    }
    if (e.key === "w") {
      board.nextActive();
    }
    if (e.key === "Escape") {
      board.noActive();
    }
    if (e.key === "r") onReset();
  };

  let requestedAnimationFrame: null | number = null;

  const fpsScores: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  function play() {
    if (requestedAnimationFrame) {
      window.cancelAnimationFrame(requestedAnimationFrame);
    }
    requestAnimationFrame(render);
  }

  let lastRenderTime = performance.now();
  let lastFps = 0;
  let i = 0;

  function renderPaused() {
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(`⏸`, canvas.width / 2, 50, 40000);
  }
  function renderFast() {
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(`⏩`, canvas.width / 2, 50, 40000);
  }

  function renderScores() {
    ctx.fillStyle = "#1a1a1a50";
    ctx.fillRect(0, 0, 120, 170);
    ctx.fillStyle = "#7FFB50";
    ctx.font = `15px Georgia`;
    ctx.textAlign = "left";
    ctx.fillText(`Total: ${board.pieces.length}`, 10, 30, 4000);
    ctx.fillText(
      `Scissors: ${board.piecesByType["scissor"].length}`,
      10,
      60,
      4000
    );
    ctx.fillText(`Rocks: ${board.piecesByType["rock"].length}`, 10, 90, 4000);
    ctx.fillText(
      `Papers: ${board.piecesByType["paper"].length}`,
      10,
      120,
      4000
    );

    const renderTime = performance.now();
    const elapsed = Math.round(renderTime - lastRenderTime);
    lastRenderTime = renderTime;
    if (i < 10 || i % 50 === 0) {
      fpsScores.shift();
      fpsScores.push(Math.floor(1000 / elapsed));

      lastFps = Math.floor(
        fpsScores.reduce((a, b) => a + b) / fpsScores.length
      );
    }
    ctx.fillText(`FPS: ${lastFps}`, 10, 150, 500);
  }

  function renderWinner() {
    ctx.save();
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(
      `Winner: ${board.winner}`,
      canvas.width / 2,
      canvas.height / 2 - 50,
      40000
    );
    ctx.fillText(
      `Press R to restart`,
      canvas.width / 2,
      canvas.height / 2 + 50,
      40000
    );
    ctx.restore();
  }
  function renderPieces() {
    ctx.save();
    lastScale = Math.min(
      canvas.width / board.width,
      canvas.height / board.height
    );
    ctx.scale(lastScale, lastScale);
    board.pieces.forEach((v, i) => v.onDraw(ctx, i === board.activeIndex));
    ctx.restore();
  }

  function render() {
    i++;
    requestedAnimationFrame = null;
    if (playing && !board.winner) {
      for (let i = 0; i < board.speed; i++) {
        if (board.pieces.length < board.maxItems) {
          board.addRandom();
        }
        board.pieces.forEach((v) => v.onTick());
      }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderPieces();

    if (board.winner) renderWinner();
    if (board.speed > 1) renderFast();
    if (!playing && !board.winner) renderPaused();

    renderScores();

    if (requestedAnimationFrame === null)
      requestedAnimationFrame = requestAnimationFrame(render);
  }

  play();
}
