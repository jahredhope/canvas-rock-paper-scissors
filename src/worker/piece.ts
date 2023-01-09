import {
  difference,
  getSquareDistance,
  multiply,
  mutAddition,
  mutMultiply,
  newPoint,
  normalize,
  Point,
} from "../point";

import { Section, Sections } from "./section";
import { Board } from "./board";

export enum Item {
  scissor = 0,
  rock = 1,
  paper = 2,
}

const mapItemToPrey: Record<Item, Item> = {
  [Item.rock]: Item.scissor,
  [Item.scissor]: Item.paper,
  [Item.paper]: Item.rock,
};
const mapItemToPredator: Record<Item, Item> = {
  [Item.scissor]: Item.rock,
  [Item.paper]: Item.scissor,
  [Item.rock]: Item.paper,
};

interface PieceConfig {
  width: number;
  height: number;
  size: number;
  speed: number;
}

export class Piece {
  constructor(
    public pos: Point,
    public item: Item,
    public config: PieceConfig,
    private board: Board,
    sections: Sections
  ) {
    this.section = sections.add(this);
  }
  section: Section;
  dir = newPoint();

  closestPrey: Piece | null = null;
  closestPredator: Piece | null = null;

  forceFromPredator: Point | null = null;
  forceFromPrey: Point | null = null;

  getClosestToByType(type: Item, maxLevel = 30) {
    for (
      let i = 0;
      i < this.section.nearbyByLevel.length && i <= maxLevel;
      i++
    ) {
      let res = getClosestTo(this, this.section.nearbyByType[type][i]);
      if (res.closest) {
        return res;
      }
    }
    return { closest: null, distance: Number.MAX_VALUE };
  }

  think() {
    let { closest: closestPrey, distance: distanceToPrey } =
      this.getClosestToByType(mapItemToPrey[this.item]);
    this.closestPrey = closestPrey;
    if (closestPrey && distanceToPrey < this.config.size * 1.5) {
      this.board.changeItem(closestPrey, this.item);
    }
    let { closest: closestPredator, distance: distanceToPredator } =
      this.getClosestToByType(mapItemToPredator[this.item]);
    this.closestPredator = closestPredator;
    if (closestPredator && distanceToPredator < this.config.size * 1.5) {
      this.board.changeItem(this, closestPredator.item);
    }
    let { closest: closestAlly, distance: distanceToAlly } =
      this.getClosestToByType(this.item, 1);
    let directionToMove = newPoint();
    if (closestPrey) {
      this.forceFromPrey = normalize(difference(closestPrey.pos, this.pos));
      if (closestPredator) {
        mutMultiply(
          this.forceFromPrey,
          distanceToPredator / (distanceToPrey + distanceToPredator)
        );
      }
      mutAddition(directionToMove, this.forceFromPrey);
    } else {
      this.forceFromPrey = null;
    }
    if (closestPredator) {
      this.forceFromPredator = normalize(
        difference(this.pos, closestPredator.pos)
      );
      if (closestPredator) {
        mutMultiply(
          this.forceFromPredator,
          distanceToPrey / (distanceToPrey + distanceToPredator)
        );
      }
      mutAddition(directionToMove, this.forceFromPredator);
    } else {
      this.forceFromPredator = null;
    }
    if (closestAlly && distanceToAlly < this.config.size * 3) {
      mutAddition(
        directionToMove,
        multiply(difference(this.pos, closestAlly.pos), 0.02)
      );
    }

    this.dir = normalize(directionToMove);
  }

  ensureWithinBoarders() {
    // Check if passed a border
    if (this.pos[0] < this.config.size) this.pos[0] = this.config.size;
    if (this.pos[1] < this.config.size) this.pos[1] = this.config.size;
    if (this.pos[0] > this.config.width - this.config.size)
      this.pos[0] = this.config.width - this.config.size;
    if (this.pos[1] > this.config.height - this.config.size)
      this.pos[1] = this.config.height - this.config.size;
  }

  move() {
    mutAddition(this.pos, multiply(this.dir, this.config.speed));
    this.ensureWithinBoarders();

    this.section = this.section.update(this);
  }
}

function getClosestTo(
  curr: Piece,
  arrOfArr: Piece[][]
): { closest: Piece | null; distance: number } {
  let closest: Piece | null = null;
  let shortestDistance = Number.MAX_VALUE;
  let shortestSquaredDistance = Number.MAX_VALUE;
  for (
    let arrOfArrIndex = 0;
    arrOfArrIndex < arrOfArr.length;
    arrOfArrIndex++
  ) {
    for (
      let arrIndex = 0;
      arrIndex < arrOfArr[arrOfArrIndex].length;
      arrIndex++
    ) {
      const v = arrOfArr[arrOfArrIndex][arrIndex];
      if (v === curr) {
        continue;
      }
      if (
        Math.abs(curr.pos[0] - v.pos[0]) + Math.abs(curr.pos[1] - v.pos[1]) >
        shortestDistance * 1.45
      )
        continue;
      const squaredDistance = getSquareDistance(curr.pos, v.pos);
      if (squaredDistance < shortestSquaredDistance) {
        closest = v;
        shortestSquaredDistance = squaredDistance;
        shortestDistance = Math.sqrt(squaredDistance);
      }
    }
  }
  if (!closest) {
    return { closest, distance: Number.MAX_VALUE };
  }
  return { closest, distance: shortestDistance };
}
