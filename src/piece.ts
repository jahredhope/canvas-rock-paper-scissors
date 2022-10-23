import { Board, Section } from "./board";
import {
  addition,
  difference,
  getDistance,
  multiply,
  normalize,
  Point,
} from "./point";

export type Item = "rock" | "paper" | "scissor";

const mapItemToPrey: Record<Item, Item> = {
  rock: "scissor",
  scissor: "paper",
  paper: "rock",
};
const mapItemToPredator: Record<Item, Item> = {
  scissor: "rock",
  paper: "scissor",
  rock: "paper",
};

function getClosestTo(
  curr: Piece,
  arrOfArr: Piece[][]
): { closest: Piece | null; distance: number } {
  let closest: Piece | null = null;
  let shortestDistance = Number.MAX_VALUE;
  for (let arr of arrOfArr) {
    for (let v of arr) {
      if (v === curr) {
        continue;
      }
      if (
        Math.abs(curr.pos.x - v.pos.x) + Math.abs(curr.pos.y - v.pos.y) >
        shortestDistance * 1.45
      )
        continue;
      const distance = getDistance(curr.pos, v.pos);
      if (distance < shortestDistance) {
        closest = v;
        shortestDistance = distance;
      }
    }
  }
  return { closest, distance: shortestDistance };
}

export class Piece {
  constructor(private board: Board, public item: Item, public pos: Point) {
    this.size = board.width > 500 ? 12 : 8;
    this.section = this.board.getSection(this.pos);
    this.section.piecesByType[this.item].push(this);
  }
  updateSection() {
    this.section = this.board.getSection(this.pos);
    this.section.piecesByType[this.item].push(this);
  }
  section: Section;
  dir: Point = { x: 0, y: 0 };
  size: number;
  speed = 1;
  flash = 0;
  maxFlash = 5;
  shouldDrawBoundary = false;

  closestPrey: Piece | null = null;
  closestPredator: Piece | null = null;

  forceFromPredator: Point | null = null;
  forceFromPrey: Point | null = null;

  getNearbyItems(type: Item, level: number) {
    const r = [];
    for (let s of this.section.nearbyByLevel[level]) {
      r.push(s.piecesByType[type]);
    }
    return r;
  }

  getColor() {
    switch (this.item) {
      case "paper":
        return "red";
      case "rock":
        return "blue";
      case "scissor":
        return "green";
    }
  }
  getText() {
    switch (this.item) {
      case "paper":
        return "📄";
      case "rock":
        return "🪨";
      case "scissor":
        return "✂️";
    }
  }
  drawArrow(ctx: CanvasRenderingContext2D, p: Point, color: string, m = 1) {
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    const tip = addition(this.pos, multiply(p, m));
    ctx.lineTo(tip.x, tip.y);
    ctx.lineWidth = this.size / 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  drawCircle(ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size * 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }
  onDraw(ctx: CanvasRenderingContext2D, active: boolean) {
    if (active) {
      this.drawCircle(ctx, "#FFFF0066");
      this.closestPredator?.drawCircle(ctx, "#FF000044");
      this.closestPrey?.drawCircle(ctx, "#00FF0044");
      this.drawArrow(ctx, this.dir, "#FFFF0066", this.size * 5);
      this.forceFromPrey &&
        this.drawArrow(ctx, this.forceFromPrey, "green", this.size * 5);
      this.forceFromPredator &&
        this.drawArrow(ctx, this.forceFromPredator, "red", this.size * 5);
    }
    if (this.flash > 0) {
      const additionalSize =
        this.maxFlash - Math.abs(this.flash - this.maxFlash / 2);
      ctx.beginPath();
      ctx.arc(
        this.pos.x,
        this.pos.y,
        this.size + additionalSize,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = "#FFFFFF66";
      ctx.fill();
    }
    if (this.shouldDrawBoundary) {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
    ctx.fillStyle = this.getColor();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${this.size * 2}px Georgia`;
    ctx.fillText(this.getText(), this.pos.x, this.pos.y, this.size * 20);
  }
  startFlash() {
    this.flash = this.maxFlash;
  }
  getClosestToByType(type: Item, maxLevel = Number.MAX_VALUE) {
    for (
      let i = 0;
      i < this.section.nearbyByLevel.length && i <= maxLevel;
      i++
    ) {
      let res = getClosestTo(this, this.getNearbyItems(type, i));
      if (res.closest) return res;
    }
    return { closest: null, distance: Number.MAX_VALUE };
  }
  onTick() {
    if (this.flash > 0) this.flash -= 0.2;

    let { closest: closestPrey, distance: distanceToPrey } =
      this.getClosestToByType(mapItemToPrey[this.item]);
    this.closestPrey = closestPrey;
    if (closestPrey && distanceToPrey < this.size * 1.5) {
      this.board.change(closestPrey, this.item);
    }
    let { closest: closestPredator, distance: distanceToPredator } =
      this.getClosestToByType(mapItemToPredator[this.item], 2);
    this.closestPredator = closestPredator;
    if (closestPredator && distanceToPredator < this.size * 1.5) {
      this.board.change(this, closestPredator.item);
    }
    let { closest: closestAlly, distance: distanceToAlly } =
      this.getClosestToByType(this.item, 1);
    let directionToMove: Point = { x: 0, y: 0 };
    if (closestPrey) {
      this.forceFromPrey = normalize(difference(closestPrey.pos, this.pos));
      if (closestPredator) {
        this.forceFromPrey = multiply(
          this.forceFromPrey,
          distanceToPredator / (distanceToPrey + distanceToPredator)
        );
      }
      directionToMove = this.forceFromPrey;
    } else {
      this.forceFromPrey = null;
    }
    if (closestPredator) {
      this.forceFromPredator = normalize(
        difference(this.pos, closestPredator.pos)
      );
      if (closestPredator) {
        this.forceFromPredator = multiply(
          this.forceFromPredator,
          distanceToPrey / (distanceToPrey + distanceToPredator)
        );
      }
      directionToMove = addition(directionToMove, this.forceFromPredator);
    } else {
      this.forceFromPredator = null;
    }
    if (closestAlly && distanceToAlly < this.size * 3) {
      directionToMove = addition(
        directionToMove,
        multiply(difference(this.pos, closestAlly.pos), 0.02)
      );
    }
    directionToMove = normalize(directionToMove);

    this.dir = directionToMove;

    this.pos.x += directionToMove.x * this.speed;
    this.pos.y += directionToMove.y * this.speed;

    if (this.board.borderType === "wrap") {
      // Wrap
      if (this.pos.x < 0) this.pos.x += this.board.width;
      if (this.pos.y < 0) this.pos.y += this.board.height;
      if (this.pos.x > this.board.width - 0) this.pos.x -= this.board.width;
      if (this.pos.y > this.board.height - 0) this.pos.y -= this.board.height;
    } else {
      // Border
      if (this.pos.x < this.size) this.pos.x = this.size;
      if (this.pos.y < this.size) this.pos.y = this.size;
      if (this.pos.x > this.board.width - this.size)
        this.pos.x = this.board.width - this.size;
      if (this.pos.y > this.board.height - this.size)
        this.pos.y = this.board.height - this.size;
    }

    if (
      this.pos.x < this.section.start.x ||
      this.pos.x > this.section.end.x ||
      this.pos.y < this.section.start.y ||
      this.pos.y > this.section.end.y
    ) {
      this.section.piecesByType[this.item].splice(
        this.section.piecesByType[this.item].indexOf(this),
        1
      );
      this.section = this.board.getSection(this.pos);
      this.section.piecesByType[this.item].push(this);
    }
  }
}
