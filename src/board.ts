import { Piece, Item } from "./piece";
import { getDistance, Point } from "./point";

export type BorderType = "solid" | "wrap";

export class Board {
  constructor(
    private ctx: CanvasRenderingContext2D,
    public height: number,
    public width: number,
    public maxItems: number,
    public borderType: BorderType
  ) {}
  pieces: Piece[] = [];
  piecesByType: Record<Item, Piece[]> = {
    rock: [],
    scissor: [],
    paper: [],
  };
  activeIndex = -1;
  winner: Item | null = null;
  nextActive() {
    this.activeIndex++;
    this.activeIndex = this.activeIndex % this.pieces.length;
  }
  noActive() {
    this.activeIndex = -1;
  }
  addPiece(t: Piece) {
    this.pieces.push(t);
    this.piecesByType[t.item].push(t);
  }
  changeCount(count: number) {
    this.maxItems = count;
    while (this.pieces.length > count) {
      this.removePiece();
    }
  }
  change(t: Piece, i: Item) {
    this.piecesByType[t.item].splice(this.piecesByType[t.item].indexOf(t), 1);
    if (this.piecesByType[t.item].length === 0) {
      this.winner = i;
    }
    this.piecesByType[i].push(t);
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
    if (closest) this.activeIndex = this.pieces.indexOf(closest);
    else this.activeIndex = -1;
  }
  addRandom(i?: Item) {
    if (!i) {
      const r = Math.random();
      i = r > 0.66666 ? "paper" : r > 0.33333 ? "scissor" : "rock";
    }
    const t = new Piece(this.ctx, this, i, {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    });
    this.addPiece(t);
  }
  removePiece() {
    const t = this.pieces.pop();
    if (!t) return;
    this.piecesByType[t.item].splice(this.piecesByType[t.item].indexOf(t), 1);
  }
  reset() {
    this.activeIndex = -1;
    this.winner = null;
    this.pieces = [];
    this.piecesByType = {
      rock: [],
      scissor: [],
      paper: [],
    };
    for (let i = 0; i < this.maxItems / 3; i++) {
      this.addRandom("paper");
      this.addRandom("scissor");
      this.addRandom("rock");
    }
  }
}
