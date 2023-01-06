import { Item, Piece } from "./piece";
import { Point } from "../point";

export class Sections {
  constructor(height: number, width: number, divisions: number) {
    const idealDivisions = divisions;
    let xCount;
    let yCount;
    if (height > width) {
      yCount = idealDivisions;
      xCount = Math.ceil(width / (height / idealDivisions));
    } else {
      xCount = idealDivisions;
      yCount = Math.ceil(height / (width / idealDivisions));
    }

    for (let y = 0; y < yCount; y++) {
      this.sections[y] ||= [];
      for (let x = 0; x < xCount; x++) {
        this.sections[y][x] = new Section(this, {
          x,
          y,
          width: width / xCount,
          height: height / yCount,
          start: [(x * width) / xCount, (y * height) / yCount],
          end: [((x + 1) * width) / xCount, ((y + 1) * height) / yCount],
        });
      }
    }

    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        this.sections[y][x].nearbyByLevel = getNearbySectionsByLevel(
          this.sections[y][x],
          this.sections
        );
      }
    }

    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        const types: Item[] = [0, 1, 2];
        for (let t of types) {
          this.sections[y][x].nearbyByType[t] = this.sections[y][
            x
          ].nearbyByLevel.map((v) => v.map((s) => s.piecesByType[t]));
        }
        this.sections[y][x].nearbyByLevel = getNearbySectionsByLevel(
          this.sections[y][x],
          this.sections
        );
      }
    }
  }
  sections: Section[][] = [];

  private getSection(p: Point): Section {
    for (let y = 0; y < this.sections.length; y++) {
      if (this.sections[y][0].end[1] < p[1]) continue;
      for (let x = 0; x < this.sections[0].length; x++) {
        if (this.sections[y][x].end[0] < p[0]) continue;
        return this.sections[y][x];
      }
    }
    throw new Error(`Unable to find section for point ${p}`);
  }

  add(piece: Piece) {
    const section = this.getSection(piece.pos);
    section.add(piece);
    return section;
  }
  remove(piece: Piece) {
    const section = this.getSection(piece.pos);
    section.remove(piece);
    return section;
  }
}

export class Section {
  constructor(
    private parent: Sections,
    options: {
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
      width: number;
      height: number;
    }
  ) {
    this.x = options.x;
    this.y = options.y;
    this.start = options.start;
    this.end = options.end;
    this.width = options.width;
    this.height = options.height;
  }
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
  width: number;
  height: number;

  piecesByType: Record<Item, Piece[]> = { 0: [], 1: [], 2: [] };
  nearbyByLevel: Section[][] = [];
  nearbyByType: Record<Item, Piece[][][]> = { 0: [], 1: [], 2: [] };

  public add(piece: Piece) {
    this.piecesByType[piece.item].push(piece);
  }
  /**
   * Removes the piece from the current section, adds and returns a new section
   * @param piece The piece to be updated to a new section
   * @returns The new section
   */
  public update(piece: Piece) {
    // Check if moved to new section
    if (
      piece.pos[0] < this.start[0] ||
      piece.pos[0] > this.end[0] ||
      piece.pos[1] < this.start[1] ||
      piece.pos[1] > this.end[1]
    ) {
      this.remove(piece);
      return this.parent.add(piece);
    }
    return this;
  }
  public remove(piece: Piece) {
    const existingIndex = this.piecesByType[piece.item].indexOf(piece);
    if (existingIndex !== -1) {
      this.piecesByType[piece.item].splice(existingIndex, 1);
    }
  }
}

function getNearbySections(section: Section, all: Section[][], level: number) {
  const res: Section[] = [];
  if (level === 0) {
    res.push(section);
  }
  const x = section.x;
  const y = section.y;
  const min = Math.floor(Math.pow(level, 1.3) + 1);
  const max = Math.floor(Math.pow(level + 1, 1.3) + 1);

  const getFromAll = (p: Point) => {
    const v = all[p[1]]?.[p[0]];
    return v;
  };
  for (let i = min; i < max; i++) {
    for (let j = 0; j < i * 2; j++) {
      res.push(getFromAll([x - i + j, y - i]));
      res.push(getFromAll([x - i, y + i - j]));
      res.push(getFromAll([x + i, y - i + j]));
      res.push(getFromAll([x + i - j, y + i]));
    }
  }
  return res.filter((v) => {
    return Boolean(v);
  });
}

function getNearbySectionsByLevel(section: Section, all: Section[][]) {
  const res = [];
  for (let i = 0; true; i++) {
    const arr = getNearbySections(section, all, i);
    if (arr.length === 0) break;
    res.push(arr);
  }
  return res;
}
