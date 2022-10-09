import { Board } from "./game";
import "./style.css";

const countInput = document.getElementById("count") as HTMLInputElement;
const pauseButton = document.getElementById("pause") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Unable to find canvas");
}

function onChangeCount() {
  const value = Number.parseInt(countInput.value);
  if (value) board.changeCount(value);
}
countInput.onchange = onChangeCount;
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;

let ctx = canvas.getContext("2d")!;

const _maxItems = Math.min(
  Math.ceil(canvas.height * canvas.width * 0.0004),
  500
);
countInput.value = _maxItems.toString();
const board = new Board(ctx, canvas.height, canvas.width, _maxItems, "solid");

function onResize() {
  canvas.width = document.body.scrollWidth;
  canvas.height = document.body.scrollHeight;

  board.width = canvas.width;
  board.height = canvas.height;
}

window.onresize = onResize;
onResize();

console.log(`Based on screen size choosing ${board.maxItems} items`);

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

function renderFps() {
  ctx.fillStyle = "#1a1a1a50";
  ctx.fillRect(canvas.width - 75, 0, 75, 50);
  const renderTime = performance.now();
  const elapsed = Math.round(renderTime - lastRenderTime);
  lastRenderTime = renderTime;
  if (i < 10 || i % 50 === 0) {
    fpsScores.shift();
    fpsScores.push(Math.floor(1000 / elapsed));

    lastFps = Math.floor(fpsScores.reduce((a, b) => a + b) / fpsScores.length);
  }

  ctx.fillStyle = "#7FFB50";
  ctx.font = `15px Georgia`;
  ctx.textAlign = "right";
  ctx.fillText(`FPS: ${lastFps}`, canvas.width - 10, 25, 500);
}

function renderPaused() {
  ctx.fillStyle = "#7FFB50";
  ctx.font = `30px Georgia`;
  ctx.textAlign = "center";
  ctx.fillText(
    `Press Space to Play (R to restart)`,
    canvas.width / 2,
    canvas.height / 2 + 50,
    40000
  );
}

function renderScores() {
  ctx.fillStyle = "#1a1a1a50";
  ctx.fillRect(0, 0, 120, 110);
  ctx.fillStyle = "#7FFB50";
  ctx.font = `15px Georgia`;
  ctx.textAlign = "left";
  ctx.fillText(
    `Scissors: ${board.thingsByType["scissor"].length}`,
    10,
    30,
    4000
  );
  ctx.fillText(`Rocks: ${board.thingsByType["rock"].length}`, 10, 60, 4000);
  ctx.fillText(`Papers: ${board.thingsByType["paper"].length}`, 10, 90, 4000);
}

function render() {
  i++;
  requestedAnimationFrame = null;
  if (playing && !board.winner) {
    if (board.things.length < board.maxItems) {
      board.addRandom();
    }
    board.things.forEach((v) => v.onTick());
    board.things = board.things.filter((v) => !v.toDelete);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.things.forEach((v, i) => v.onDraw(i === board.activeIndex));

  renderFps();

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

  ctx.textBaseline = "middle";
  if (!playing && !board.winner) {
    renderPaused();
  }
  renderScores();

  if (requestedAnimationFrame === null)
    requestedAnimationFrame = requestAnimationFrame(render);
}

play();
