import { Board } from "./board";
import { multiply, Point } from "./point";

export function getUIElements() {
  return {
    sidePanel: document.getElementById("side") as HTMLDivElement,

    pauseButton: document.getElementById("pause") as HTMLButtonElement,
    resetButton: document.getElementById("reset") as HTMLButtonElement,
    fastFwdButton: document.getElementById("fast") as HTMLButtonElement,
    moreButton: document.getElementById("more") as HTMLButtonElement,

    countInput: document.getElementById("count") as HTMLInputElement,

    heightInput: document.getElementById("height") as HTMLInputElement,
    widthInput: document.getElementById("width") as HTMLInputElement,
    autoSizeInput: document.getElementById("autosize") as HTMLInputElement,
    hideInput: document.getElementById("hide") as HTMLInputElement,

    seedInput: document.getElementById("seed") as HTMLInputElement,
  };
}

export function setupUI(
  board: Board,
  canvas: HTMLCanvasElement,
  play: () => void
) {
  const elements = getUIElements();
  elements.heightInput.value = board.state.height.toString();
  elements.widthInput.value = board.state.width.toString();
  elements.countInput.value = board.state.maxItems.toString();
  elements.seedInput.value = board.state.seed.toString();
  elements.autoSizeInput.checked = board.state.autoSize;
  elements.hideInput.checked = board.state.hideUI;

  function onResize() {
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;

    if (board.state.autoSize) {
      board.changeSize(canvas.width, canvas.height);
      elements.heightInput.value = board.state.height.toString();
      elements.widthInput.value = board.state.width.toString();
    } else {
      board.state.height = Number(elements.heightInput.value);
      board.state.width = Number(elements.widthInput.value);
    }
  }
  elements.autoSizeInput.onchange = (e) => {
    board.state.autoSize = (e.target as HTMLInputElement).checked;
    if (board.state.autoSize) onResize();
  };
  elements.hideInput.onchange = (e) => {
    board.state.hideUI = (e.target as HTMLInputElement).checked;
  };

  elements.heightInput.onchange = onResize;
  elements.widthInput.onchange = onResize;

  window.onresize = onResize;

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

  function onPause() {
    board.state.playing = !board.state.playing;
    if (board.state.playing) play();
  }

  function onReset() {
    board.reset();
  }
  elements.pauseButton.onclick = onPause;
  elements.resetButton.onclick = onReset;

  canvas.onclick = (e) => {
    const p: Point = multiply(
      [e.clientX, e.clientY],
      1 / board.state.lastScale
    );
    board.selectPoint(p);
  };

  function onChangeCount() {
    const value = Number.parseInt(elements.countInput.value);
    if (value) board.changeCount(value);
  }
  elements.countInput.onchange = onChangeCount;
  elements.fastFwdButton.onclick = () => {
    board.state.speed = board.state.speed === 1 ? 3 : 1;
  };

  elements.moreButton.onclick = () => {
    if (elements.sidePanel.classList.contains("hide"))
      elements.sidePanel.classList.remove("hide");
    else elements.sidePanel.classList.add("hide");
  };
}
