import { ParentMessage } from "./messages";
import { Point } from "./point";
import { getRandomSeed } from "./random";
import { State } from "./state";

export function getUIElements() {
  return {
    header: document.getElementById("header") as HTMLDivElement,
    footer: document.getElementById("footer") as HTMLDivElement,
    sidePanel: document.getElementById("side") as HTMLDivElement,

    pauseButton: document.getElementById("pause") as HTMLButtonElement,
    resetButtons: document.getElementsByName(
      "reset"
    ) as NodeListOf<HTMLButtonElement>,
    fastFwdButton: document.getElementById("fast") as HTMLButtonElement,
    moreButton: document.getElementById("more") as HTMLButtonElement,
    sizeToScreenButton: document.getElementById(
      "size-to-screen"
    ) as HTMLButtonElement,

    rateSelectButtons: document.getElementsByName(
      "rate-select"
    ) as NodeListOf<HTMLButtonElement>,
    shareButtons: document.getElementsByName(
      "share"
    ) as NodeListOf<HTMLButtonElement>,
    speedSelectButtons: document.getElementsByName(
      "speed-select"
    ) as NodeListOf<HTMLButtonElement>,

    countInput: document.getElementById("count") as HTMLInputElement,

    heightInput: document.getElementById("height") as HTMLInputElement,
    widthInput: document.getElementById("width") as HTMLInputElement,

    seedInput: document.getElementById("seed") as HTMLInputElement,
  };
}

export function setupUI(
  state: State,
  canvas: HTMLCanvasElement,
  forceUpdate: () => void,
  fire: (message: ParentMessage) => void,
  selectPoint: (p: Point) => void,
  initialize: () => void
) {
  // @ts-expect-error Make state available for debug
  window.debugState = state;

  const elements = getUIElements();
  elements.heightInput.value = state.height.toString();
  elements.widthInput.value = state.width.toString();
  elements.countInput.value = state.items.toString();
  elements.seedInput.value = state.seed.toString();

  function onResize() {
    state.height = Number(elements.heightInput.value);
    state.width = Number(elements.widthInput.value);
    canvas.height = state.height;
    canvas.width = state.width;
    fire({ type: "set-size", width: state.width, height: state.height });
  }

  elements.heightInput.onchange = onResize;
  elements.widthInput.onchange = onResize;

  elements.shareButtons.forEach((el) => {
    el.onclick = () => {
      const url = new URL(window.location.origin);
      const keys: Array<keyof typeof state> = [
        "seed",
        "height",
        "width",
        "size",
        "items",
        "speed",
      ];
      for (let key of keys) {
        if (!state[key]) {
          return;
        }
        url.searchParams.set(key, state[key]!.toString());
      }
      if (window.navigator.share) {
        window.navigator.share({ url: url.toString() });
      } else {
        window.navigator.clipboard.writeText(url.toString());
      }
    };
  });

  // window.onresize = onResize;

  window.document.body.onkeyup = (e) => {
    if (e.target !== window.document.body) return;
    if (e.key === " ") {
      onPause();
    }
    if (e.key === "1") {
      state.pieceToPlace = 0;
      state.mode = "click-to-place";
    }
    if (e.key === "2") {
      state.pieceToPlace = 1;
      state.mode = "click-to-place";
    }
    if (e.key === "3") {
      state.pieceToPlace = 2;
      state.mode = "click-to-place";
    }
    if (e.key === "e") {
      state.mode = "click-to-place";
    }
    if (e.key === "d") {
      state.mode = "click-to-debug";
    }
    if (e.key === "w") {
      fire({ type: "set-active", index: ++state.activeIndex });
    }
    if (e.key === "h") {
      toggleHide();
    }
    if (e.key === "Escape") {
      fire({ type: "set-active", index: -1 });
    }
    if (e.key === "r") onReset();
  };

  elements.rateSelectButtons.forEach((el) => {
    el.onclick = () => {
      const val = Number.parseInt(el.value);
      state.rate = val;
      fire({ type: "set-framerate", rate: state.rate });
    };
  });
  elements.speedSelectButtons.forEach((el) => {
    el.onclick = () => {
      const val = Number.parseInt(el.value);
      state.speed = val;
      fire({ type: "set-speed", speed: state.speed });
    };
  });
  elements.sizeToScreenButton.onclick = () => {
    const height = document.body.scrollHeight;
    const width = document.body.scrollWidth;
    elements.heightInput.value = height.toString();
    elements.widthInput.value = width.toString();
    onResize();
  };

  elements.seedInput.onchange = () => {
    state.lockSeed = true;
    state.seed = elements.seedInput.value;
    initialize();
  };

  function onPause() {
    fire({ type: "pause" });
    state.playing = !state.playing;
    forceUpdate();
  }

  function onReset() {
    if (!state.lockSeed) {
      state.seed = getRandomSeed();
      elements.seedInput.value = state.seed.toString();
    }
    initialize();
  }
  elements.pauseButton.onclick = onPause;
  elements.resetButtons.forEach((el) => (el.onclick = onReset));

  canvas.onclick = (e: MouseEvent) => {
    const el = e.target as HTMLCanvasElement;
    if (!el || !(el instanceof HTMLCanvasElement)) {
      console.warn("Invalid Click Target", el);
    }
    const point: Point = [
      (e.clientX - el.offsetLeft) / el.offsetWidth,
      (e.clientY - el.offsetTop) / el.offsetHeight,
    ];
    selectPoint(point);
  };

  function onChangeCount() {
    const value = Number.parseInt(elements.countInput.value);
    state.items = value;
    initialize();
  }
  elements.countInput.onchange = onChangeCount;

  elements.moreButton.onclick = () => {
    if (elements.sidePanel.classList.contains("hide"))
      elements.sidePanel.classList.remove("hide");
    else elements.sidePanel.classList.add("hide");
  };

  if (state.hide) {
    elements.header.classList.add("hide");
    elements.footer.classList.add("hide");
  }
  function toggleHide() {
    state.hide = !state.hide;
    if (state.hide) {
      elements.header.classList.add("hide");
      elements.footer.classList.add("hide");
      elements.sidePanel.classList.add("hide");
    } else {
      elements.header.classList.remove("hide");
      elements.footer.classList.remove("hide");
    }
    forceUpdate();
  }
}
