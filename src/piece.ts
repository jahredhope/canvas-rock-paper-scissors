import { Board, Section } from "./board";
import {
  addition,
  difference,
  getDistance,
  multiply,
  normalize,
  Point,
} from "./point";

import scissorSrc from "./assets/scissors_emoji_apple.png";
import paperSrc from "./assets/page_emoji_apple.png";
import rockSrc from "./assets/rock_emoji_apple.png";

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

const scissorImg = new Image();
scissorImg.src = scissorSrc;
const paperImg = new Image();
paperImg.src = paperSrc;
const rockImg = new Image();
rockImg.src = rockSrc;

const mapItemToImage: Record<Item, HTMLImageElement> = {
  scissor: scissorImg,
  paper: paperImg,
  rock: rockImg,
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
        Math.abs(curr.pos[0] - v.pos[0]) + Math.abs(curr.pos[1] - v.pos[1]) >
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
  dir: Point = [0, 0];
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
    ctx.moveTo(this.pos[0], this.pos[1]);
    const tip = addition(this.pos, multiply(p, m));
    ctx.lineTo(tip[0], tip[1]);
    ctx.lineWidth = this.size / 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  drawCircle(ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], this.size * 2, 0, 2 * Math.PI, false);
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
        this.pos[0],
        this.pos[1],
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
      ctx.arc(this.pos[0], this.pos[1], this.size, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
    this.drawIcon(ctx);
  }
  drawIcon(ctx: CanvasRenderingContext2D) {
    const asText = true;
    if (asText) {
      ctx.fillStyle = this.getColor();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${this.size * 2}px Georgia`;
      ctx.fillText(this.getText(), this.pos[0], this.pos[1], this.size * 20);
    } else {
      ctx.drawImage(
        mapItemToImage[this.item],
        this.pos[0],
        this.pos[1],
        this.size * 2,
        this.size * 2
      );
    }
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
    let directionToMove: Point = [0, 0];
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

    this.pos[0] += directionToMove[0] * this.speed;
    this.pos[1] += directionToMove[1] * this.speed;

    if (this.board.borderType === "wrap") {
      // Wrap
      if (this.pos[0] < 0) this.pos[0] += this.board.width;
      if (this.pos[1] < 0) this.pos[1] += this.board.height;
      if (this.pos[0] > this.board.width - 0) this.pos[0] -= this.board.width;
      if (this.pos[1] > this.board.height - 0) this.pos[1] -= this.board.height;
    } else {
      // Border
      if (this.pos[0] < this.size) this.pos[0] = this.size;
      if (this.pos[1] < this.size) this.pos[1] = this.size;
      if (this.pos[0] > this.board.width - this.size)
        this.pos[0] = this.board.width - this.size;
      if (this.pos[1] > this.board.height - this.size)
        this.pos[1] = this.board.height - this.size;
    }

    if (
      this.pos[0] < this.section.start[0] ||
      this.pos[0] > this.section.end[0] ||
      this.pos[1] < this.section.start[1] ||
      this.pos[1] > this.section.end[1]
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
