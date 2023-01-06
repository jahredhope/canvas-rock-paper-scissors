import { addition, multiply, Point } from "./point";

import scissorSrc from "./assets/scissors_emoji_apple.png";
import paperSrc from "./assets/page_emoji_apple.png";
import rockSrc from "./assets/rock_emoji_apple.png";
import { ActiveItem } from "./messages";

export enum Item {
  scissor = 0,
  rock = 1,
  paper = 2,
}

export interface RenderPiece {
  pos: Point;
  item: Item;
}

const scissorImg = new Image();
scissorImg.src = scissorSrc;
const paperImg = new Image();
paperImg.src = paperSrc;
const rockImg = new Image();
rockImg.src = rockSrc;

const mapItemToImage: Record<Item, HTMLImageElement> = {
  0: scissorImg,
  2: paperImg,
  1: rockImg,
};

function getColor(item: Item) {
  switch (item) {
    case Item.paper:
      return "red";
    case Item.rock:
      return "blue";
    case Item.scissor:
      return "green";
  }
}
function getText(item: Item) {
  switch (item) {
    case Item.paper:
      return "📄";
    case Item.rock:
      return "🪨";
    case Item.scissor:
      return "✂️";
  }
}
export function drawPiece(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  item: Item,
  size: number
) {
  const asText = false;
  if (asText) {
    ctx.fillStyle = getColor(item);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${size * 2}px Georgia`;
    ctx.fillText(getText(item), x, y, size * 20);
  } else {
    // console.log({ size });
    ctx.drawImage(mapItemToImage[item], x - size, y - size, size * 2, size * 2);
  }
}
function drawCircle(
  ctx: CanvasRenderingContext2D,
  pos: Point,
  color: string,
  size: number
) {
  ctx.beginPath();
  ctx.arc(pos[0], pos[1], size * 2, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawActive(ctx: CanvasRenderingContext2D, active: ActiveItem) {
  drawCircle(ctx, active.pos, "#FFFF0066", active.size);
  if (active.predator)
    drawCircle(ctx, active.predator, "#FF000044", active.size);
  if (active.prey) drawCircle(ctx, active.prey, "#00FF0044", active.size);
  drawArrow(ctx, active, active.dir, "#FFFF0066", active.size * 5);
  active.preyForce &&
    drawArrow(ctx, active, active.preyForce, "green", active.size * 5);
  active.predatorForce &&
    drawArrow(ctx, active, active.predatorForce, "red", active.size * 5);
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  active: ActiveItem,
  p: Point,
  color: string,
  m = 1
) {
  ctx.beginPath();
  ctx.moveTo(active.pos[0], active.pos[1]);
  const tip = addition(active.pos, multiply(p, m));
  ctx.lineTo(tip[0], tip[1]);
  ctx.lineWidth = active.size / 2;
  ctx.strokeStyle = color;
  ctx.stroke();
}
