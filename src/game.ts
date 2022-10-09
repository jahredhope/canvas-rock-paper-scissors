import { Thing, Item } from "./piece";

export type BorderType = "solid" | "wrap";

export class Board {
  constructor(
    private ctx: CanvasRenderingContext2D,
    public height: number,
    public width: number,
    public maxItems: number,
    public borderType: BorderType
  ) {}
  things: Thing[] = [];
  thingsByType: Record<Item, Thing[]> = {
    rock: [],
    scissor: [],
    paper: [],
  };
  activeIndex = -1;
  winner: Item | null = null;
  nextActive() {
    this.activeIndex++;
  }
  noActive() {
    this.activeIndex = -1;
  }
  addPiece(t: Thing) {
    // console.log("Adding item", t.item);
    this.things.push(t);
    this.thingsByType[t.item].push(t);
  }
  changeCount(count: number) {
    this.maxItems = count;
    while (this.things.length > count) {
      this.removePiece();
    }
  }
  change(t: Thing, i: Item) {
    this.thingsByType[t.item].splice(this.thingsByType[t.item].indexOf(t), 1);
    if (this.thingsByType[t.item].length === 0) {
      this.winner = i;
    }
    // console.log(`Changed ${t.item} to ${i}`);
    this.thingsByType[i].push(t);
    t.item = i;
  }
  addRandom(i?: Item) {
    console.log("Adding random item");
    if (!i) {
      const r = Math.random();
      i = r > 0.666 ? "paper" : r > 0.333 ? "scissor" : "rock";
    }
    const t = new Thing(this.ctx, this, i, {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    });
    this.addPiece(t);
  }
  removePiece() {
    const t = this.things.pop();
    if (!t) return;
    this.thingsByType[t.item].splice(this.thingsByType[t.item].indexOf(t), 1);
  }
  reset() {
    this.winner = null;
    this.things = [];
    this.thingsByType = {
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
