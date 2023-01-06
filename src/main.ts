import { playGame } from "./play";
import "./style.css";
import { createWorker } from "./create-worker";

window.addEventListener(
  "load",
  () => {
    const worker = createWorker();
    playGame(worker);
  },
  false
);
