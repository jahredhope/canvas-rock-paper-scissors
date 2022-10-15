import { Board } from "./board";
import "./style.css";

const countInput = document.getElementById("count") as HTMLInputElement;
const pauseButton = document.getElementById("pause") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;
const fastForwardButton = document.getElementById("fast") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Unable to find canvas");
}

canvas.onclick = (e) => {
  board.selectPoint({ x: e.clientX, y: e.clientY });
};

function onChangeCount() {
  const value = Number.parseInt(countInput.value);
  if (value) board.changeCount(value);
}
countInput.onchange = onChangeCount;
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

fastForwardButton.onclick = () => {
  board.speed = board.speed === 1 ? 3 : 1;
};

let ctx = canvas.getContext("2d")!;

canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;

const _maxItems = Math.min(
  Math.ceil(canvas.height * canvas.width * 0.0005),
  600
);
countInput.value = _maxItems.toString();
const board = new Board(ctx, canvas.height, canvas.width, _maxItems, "solid");

function onResize() {
  canvas.width = document.body.scrollWidth;
  canvas.height = document.body.scrollHeight;

  board.changeSize(canvas.width, canvas.height);
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
  ctx.fillText(`Papers: ${board.piecesByType["paper"].length}`, 10, 120, 4000);

  const renderTime = performance.now();
  const elapsed = Math.round(renderTime - lastRenderTime);
  lastRenderTime = renderTime;
  if (i < 10 || i % 50 === 0) {
    fpsScores.shift();
    fpsScores.push(Math.floor(1000 / elapsed));

    lastFps = Math.floor(fpsScores.reduce((a, b) => a + b) / fpsScores.length);
  }
  ctx.fillText(`FPS: ${lastFps}`, 10, 150, 500);
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
  board.pieces.forEach((v, i) => v.onDraw(i === board.activeIndex));

  if (board.winner) {
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
  }
  if (board.speed > 1) renderFast();
  if (!playing && !board.winner) renderPaused();

  renderScores();

  if (requestedAnimationFrame === null)
    requestedAnimationFrame = requestAnimationFrame(render);
}

play();
