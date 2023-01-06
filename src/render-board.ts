import { RenderPiece, Item } from "./render-piece";
import { getSquareDistance, Point } from "./point";
import { srand } from "./random";
import { State } from "./state";

export const mapPieceToName: Record<Item, string> = {
  [Item.rock]: "Rock",
  [Item.scissor]: "Scissors",
  [Item.paper]: "Paper",
};

export class Board {
  constructor(public state: State) {
    this.rand = srand(0);
  }

  rand: ReturnType<typeof srand>;
  pieces: RenderPiece[] = [];
  piecesByType = {
    0: [],
    1: [],
    2: [],
  };

  selectPoint(pos: Point) {
    let closest: RenderPiece | null = null;
    let shortestDistance = 50 * 50;
    for (let v of this.pieces) {
      const distance = getSquareDistance(pos, v.pos);
      if (distance < shortestDistance) {
        closest = v;
        shortestDistance = distance;
      }
    }
    if (closest) this.state.activeIndex = this.pieces.indexOf(closest);
    else this.state.activeIndex = -1;
  }
  renderPaused(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (this.state.playing || this.state.winner !== null) return;
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(`⏸`, canvas.width / 2, 50, 40000);
  }

  renderScores(
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    stats: Record<Item, number>
  ) {
    const QUARTER_CIRCLE = Math.PI / 2;
    let acc = 0;
    const total = stats[Item.scissor] + stats[Item.rock] + stats[Item.paper];
    const color = {
      [Item.paper]: "#FFFFFF99",
      [Item.scissor]: "#FF000099",
      [Item.rock]: "#33666699",
    };
    for (let i: Item = 0; i < 3; i++) {
      ctx.fillStyle = color[i];
      ctx.beginPath();
      const angle = acc + 2 * Math.PI * (stats[i] / total);
      ctx.arc(50, 50, 40, acc - QUARTER_CIRCLE, angle - QUARTER_CIRCLE);
      acc = angle;
      ctx.lineTo(50, 50);
      ctx.fill();
    }
  }
}
