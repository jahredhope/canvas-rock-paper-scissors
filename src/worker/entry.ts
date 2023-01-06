import { ParentMessage, WorkerMessage } from "../messages";
import { Board } from "./board";
import { Item } from "./piece";

let targetFrameRate = 60;
let board: Board;
let activeIndex = -1;
let interval: ReturnType<typeof setInterval> | null = null;

function startLoop() {
  if (!interval) {
    interval = setInterval(onUpdate, 1000 / targetFrameRate);
  }
}

function stopLoop() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
let paused = false;
self.onmessage = (message: MessageEvent<ParentMessage>) => {
  if (message.data.type === "set-speed") {
    board.config.speed = message.data.speed;
  }
  if (message.data.type === "set-size") {
    board.changeSize(message.data);
  }
  if (message.data.type === "set-active") {
    activeIndex = message.data.index;
    if (paused) {
      console.log("Sending paused update");
      sendUpdate();
    }
  }
  if (message.data.type === "pause") {
    paused = !paused;
    if (paused) {
      stopLoop();
    } else {
      startLoop();
    }
  }
  if (message.data.type === "set-framerate") {
    changeFramerate(message.data.rate);
  }
  if (message.data.type === "initialize") {
    const { height, width, pieces, speed, size, playing } = message.data;
    targetFrameRate = message.data.targetFrameRate;
    paused = !playing;
    board = new Board(pieces, {
      height,
      width,
      activeIndex: -1,
      speed,
      size,
    });
    startLoop();
  }
};
let lastRenderTime = performance.now();
let slowRenders = 0;

function changeFramerate(rate: number) {
  targetFrameRate = rate;
  stopLoop();
  startLoop();
}

function onUpdate() {
  if (paused) stopLoop();
  if (board.winner === null) {
    const now = performance.now();
    const renderRate = 1000 / targetFrameRate / (now - lastRenderTime);
    if (renderRate > 1.3) slowRenders++;
    if (slowRenders > 5) {
      console.warn("Unable to keep up with rendering.");
      slowRenders = -5;
    }

    lastRenderTime = now;
    try {
      board.update();
    } catch (error) {
      console.error(error);
      stopLoop();
    }
    if (board.winner !== null) stopLoop();
  }
  sendUpdate();
}

function sendUpdate() {
  const arr = new Uint16Array(board.pieces.length * 3);
  for (let i = 0; i < board.pieces.length; i++) {
    arr[3 * i + 0] = board.pieces[i].item;
    arr[3 * i + 1] = board.pieces[i].pos[0];
    arr[3 * i + 2] = board.pieces[i].pos[1];
  }
  const message = {
    type: "update",
    arr: arr,
    stats: {
      [Item.rock]: board.piecesByType[Item.rock].length,
      [Item.scissor]: board.piecesByType[Item.scissor].length,
      [Item.paper]: board.piecesByType[Item.paper].length,
    },
  } as WorkerMessage;
  if (board.winner !== null) {
    message.winner = board.winner;
    stopLoop();
  }
  if (activeIndex !== -1) {
    message.active = {
      size: board.pieces[activeIndex].config.size,
      dir: board.pieces[activeIndex].dir,
      predator: board.pieces[activeIndex].closestPredator?.pos || null,
      prey: board.pieces[activeIndex].closestPrey?.pos || null,
      predatorForce: board.pieces[activeIndex].forceFromPredator || null,
      preyForce: board.pieces[activeIndex].forceFromPrey || null,
      pos: board.pieces[activeIndex].pos,
    };
  }

  // @ts-expect-error postMessage type is wrong. Second value is the transferable objects
  self.postMessage(message, [arr.buffer]);
}
