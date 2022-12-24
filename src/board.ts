import { Piece, Item } from "./piece";
import { getDistance, Point } from "./point";
import { createSeed, srand } from "./random";
import { createSections, getNearbySectionsByLevel, Section } from "./section";

export interface State {
  playing: boolean;
  speed: number;
  height: number;
  width: number;
  autoSize: boolean;
  seed: string;
  fps: number;
  renderCount: number;
  lastScale: number;
  maxItems: number;
  activeIndex: number;
}

export class Board {
  private constructor(public state: State) {
    this.rand = srand(0);
  }

  public static async createBoard(state: State) {
    const board = new Board(state);
    board.createSections();
    await board.reset();
    return board;
  }

  rand: ReturnType<typeof srand>;
  pieces: Piece[] = [];
  piecesByType: Record<Item, Piece[]> = {
    rock: [],
    scissor: [],
    paper: [],
  };
  sections: Section[][] = [];
  winner: Item | null = null;

  update() {
    for (let i = 0; i < this.state.speed; i++) {
      if (this.pieces.length < this.state.maxItems) {
        this.addRandom();
      }
      this.pieces.forEach((v) => v.think());
      this.pieces.forEach((v) => v.move());
    }
  }

  createSections() {
    this.sections = createSections(this.state.height, this.state.width, 30);

    this.sections.forEach((r) => {
      r.forEach((s) => {
        s.nearbyByLevel = getNearbySectionsByLevel(s, this.sections);
      });
    });
    this.pieces.forEach((p) => p.updateSection());
  }
  changeSize(width: number, height: number) {
    this.state.width = width;
    this.state.height = height;
    this.createSections();
  }
  getSection(p: Point) {
    const section = this.sections
      .find((r) => p[1] < r[0].end[1])
      ?.find((s) => p[0] < s.end[0]);
    if (!section) throw new Error("No section for point");
    return section;
  }
  nextActive() {
    this.state.activeIndex++;
    this.state.activeIndex = this.state.activeIndex % this.pieces.length;
  }
  noActive() {
    this.state.activeIndex = -1;
  }
  addPiece(t: Piece) {
    this.pieces.push(t);
    this.piecesByType[t.item].push(t);
  }
  changeCount(count: number) {
    this.state.maxItems = count;
    while (this.pieces.length > count) {
      this.removePiece();
    }
  }
  change(t: Piece, i: Item) {
    this.piecesByType[t.item].splice(this.piecesByType[t.item].indexOf(t), 1);
    t.section.piecesByType[t.item].splice(
      t.section.piecesByType[t.item].indexOf(t),
      1
    );
    if (this.piecesByType[t.item].length === 0) {
      this.winner = i;
    }
    this.piecesByType[i].push(t);
    t.section.piecesByType[i].push(t);
    t.item = i;
  }
  selectPoint(pos: Point) {
    let closest: Piece | null = null;
    let shortestDistance = 50;
    for (let v of this.pieces) {
      const distance = getDistance(pos, v.pos);
      if (distance < shortestDistance) {
        closest = v;
        shortestDistance = distance;
      }
    }
    if (closest) this.state.activeIndex = this.pieces.indexOf(closest);
    else this.state.activeIndex = -1;
  }
  addRandom(i?: Item) {
    if (!i) {
      const r = this.rand.next().value;
      i = r > 0.66666 ? "paper" : r > 0.33333 ? "scissor" : "rock";
    }
    const t = new Piece(this, i, [
      this.rand.next().value * this.state.width,
      this.rand.next().value * this.state.height,
    ]);
    this.addPiece(t);
  }
  removePiece() {
    const t = this.pieces.pop();
    if (!t) return;
    this.piecesByType[t.item].splice(this.piecesByType[t.item].indexOf(t), 1);
  }
  async reset() {
    const seed = await createSeed(this.state.seed);
    this.rand = srand(seed);
    this.state.activeIndex = -1;
    this.winner = null;
    this.pieces = [];
    this.piecesByType = {
      rock: [],
      scissor: [],
      paper: [],
    };
    this.createSections();

    for (let i = 0; i < this.state.maxItems / 3; i++) {
      this.addRandom("paper");
      this.addRandom("scissor");
      this.addRandom("rock");
    }
  }

  renderPaused(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(`⏸`, canvas.width / 2, 50, 40000);
  }
  renderFast(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(`⏩`, canvas.width / 2, 50, 40000);
  }

  renderScores(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement) {
    ctx.fillStyle = "#1a1a1a50";
    ctx.fillRect(0, 0, 120, 170);
    ctx.fillStyle = "#7FFB50";
    ctx.font = `15px Georgia`;
    ctx.textAlign = "left";
    ctx.fillText(`Total: ${this.pieces.length}`, 10, 30, 4000);
    ctx.fillText(
      `Scissors: ${this.piecesByType["scissor"].length}`,
      10,
      60,
      4000
    );
    ctx.fillText(`Rocks: ${this.piecesByType["rock"].length}`, 10, 90, 4000);
    ctx.fillText(`Papers: ${this.piecesByType["paper"].length}`, 10, 120, 4000);

    ctx.fillText(`FPS: ${this.state.fps}`, 10, 150, 500);
  }

  renderWinner(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.save();
    ctx.fillStyle = "#7FFB50";
    ctx.font = `30px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(
      `Winner: ${this.winner}`,
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
  renderPieces(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.save();
    this.state.lastScale = Math.min(
      canvas.width / this.state.width,
      canvas.height / this.state.height
    );
    ctx.scale(this.state.lastScale, this.state.lastScale);
    this.pieces.forEach((v, i) => v.onDraw(ctx, i === this.state.activeIndex));
    ctx.restore();
  }
}
