import { Piece, Item } from "./piece";
import { getDistance, Point } from "./point";
import { srand } from "./random";
import { createSections, getNearbySectionsByLevel } from "./section";

export type BorderType = "solid" | "wrap";

export interface Section {
  x: number;
  y: number;
  /**
   * Top Left
   */
  start: Point;
  /**
   * Bottom Right
   */
  end: Point;
  piecesByType: Record<Item, Piece[]>;
  nearbyByLevel: Section[][];
}

export class Board {
  constructor(
    public height: number,
    public width: number,
    public maxItems: number,
    public borderType: BorderType,
    private initialSeed: number
  ) {
    this.rand = srand(this.initialSeed);
    this.createSections();
    this.reset();
  }

  rand: ReturnType<typeof srand>;
  pieces: Piece[] = [];
  piecesByType: Record<Item, Piece[]> = {
    rock: [],
    scissor: [],
    paper: [],
  };
  speed = 1;
  sections: Section[][] = [];
  activeIndex = -1;
  winner: Item | null = null;

  update() {
    this.pieces.forEach((v) => v.onTick());
  }

  createSections() {
    this.sections = createSections(this.height, this.width, 30);

    this.sections.forEach((r) => {
      r.forEach((s) => {
        s.nearbyByLevel = getNearbySectionsByLevel(s, this.sections);
      });
    });
    this.pieces.forEach((p) => p.updateSection());
  }
  changeSize(width: number, height: number) {
    this.width = width;
    this.height = height;
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
    if (closest) this.activeIndex = this.pieces.indexOf(closest);
    else this.activeIndex = -1;
  }
  addRandom(i?: Item) {
    if (!i) {
      const r = this.rand.next().value;
      i = r > 0.66666 ? "paper" : r > 0.33333 ? "scissor" : "rock";
    }
    const t = new Piece(this, i, [
      this.rand.next().value * this.width,
      this.rand.next().value * this.height,
    ]);
    this.addPiece(t);
  }
  removePiece() {
    const t = this.pieces.pop();
    if (!t) return;
    this.piecesByType[t.item].splice(this.piecesByType[t.item].indexOf(t), 1);
  }
  reset() {
    this.rand = srand(this.initialSeed);
    this.activeIndex = -1;
    this.winner = null;
    this.pieces = [];
    this.piecesByType = {
      rock: [],
      scissor: [],
      paper: [],
    };
    this.createSections();

    for (let i = 0; i < this.maxItems / 3; i++) {
      this.addRandom("paper");
      this.addRandom("scissor");
      this.addRandom("rock");
    }
  }
}
