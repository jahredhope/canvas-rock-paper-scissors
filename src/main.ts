import { playGame } from "./play";
import { reportPerf } from "./report";
import "./style.css";

window.addEventListener(
  "load",
  () => {
    if (window.location.pathname === "/report") {
      reportPerf();
    } else {
      playGame();
    }
  },
  false
);
