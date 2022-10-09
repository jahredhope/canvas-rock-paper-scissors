import { Board } from "./game";
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
  curr: Thing,
  arr: Thing[]
): { closest: Thing | null; distance: number } {
  let closest: Thing | null = null;
  let shortestDistance = Number.MAX_VALUE;
  for (let v of arr) {
    if (v === curr) {
      continue;
    }
    const distance = getDistance(curr.pos, v.pos);
    if (distance < shortestDistance) {
      closest = v;
      shortestDistance = distance;
    }
  }
  return { closest, distance: shortestDistance };
}

export class Thing {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private board: Board,
    public item: Item,
    public pos: Point
  ) {
    this.size = board.width > 500 ? 15 : 10;
  }
  dir: Point = { x: 0, y: 0 };
  size: number;
  speed = 1;
  toDelete = false;
  flash = 0;
  maxFlash = 5;
  shouldDrawBoundary = false;

  closestPrey: Thing | null = null;
  closestPredator: Thing | null = null;

  forceFromPredator: Point | null = null;
  forceFromPrey: Point | null = null;

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
  drawArrow(p: Point, color: string, m = 1) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.pos.x, this.pos.y);
    const tip = addition(this.pos, multiply(p, m));
    this.ctx.lineTo(tip.x, tip.y);
    this.ctx.lineWidth = this.size / 2;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
  drawCircle(color: string) {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.size * 2, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }
  onDraw(active: boolean) {
    if (active) {
      this.drawCircle("#FFFF0066");
      this.closestPredator?.drawCircle("#FF000044");
      this.closestPrey?.drawCircle("#00FF0044");
      this.drawArrow(this.dir, "#FFFF0066", this.size * 5);
      this.forceFromPrey &&
        this.drawArrow(this.forceFromPrey, "green", this.size * 5);
      this.forceFromPredator &&
        this.drawArrow(this.forceFromPredator, "red", this.size * 5);
    }
    if (this.flash > 0) {
      const additionalSize =
        this.maxFlash - Math.abs(this.flash - this.maxFlash / 2);
      this.ctx.beginPath();
      this.ctx.arc(
        this.pos.x,
        this.pos.y,
        this.size + additionalSize,
        0,
        2 * Math.PI,
        false
      );
      this.ctx.fillStyle = "#FFFFFF66";
      this.ctx.fill();
    }
    if (this.shouldDrawBoundary) {
      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fill();
    }
    this.ctx.fillStyle = this.getColor();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = `${this.size * 2}px Georgia`;
    this.ctx.fillText(this.getText(), this.pos.x, this.pos.y, this.size * 20);
  }
  startFlash() {
    this.flash = this.maxFlash;
  }
  onTick() {
    if (this.flash > 0) this.flash -= 0.2;
    if (this.toDelete) {
      return;
    }

    let { closest: closestPrey, distance: distanceToPrey } = getClosestTo(
      this,
      this.board.thingsByType[mapItemToPrey[this.item]]
    );
    this.closestPrey = closestPrey;
    if (closestPrey && distanceToPrey < this.size * 1.5) {
      this.board.change(closestPrey, this.item);
    }
    let { closest: closestPredator, distance: distanceToPredator } =
      getClosestTo(this, this.board.thingsByType[mapItemToPredator[this.item]]);
    this.closestPredator = closestPredator;
    if (closestPredator && distanceToPredator < this.size * 1.5) {
      this.board.change(this, closestPredator.item);
    }
    let { closest: closestAlly, distance: distanceToAlly } = getClosestTo(
      this,
      this.board.thingsByType[this.item]
    );
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
  }
}
