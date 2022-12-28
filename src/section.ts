import { Item, Piece } from "./piece";
import { Point } from "./point";

type Sections = Section[][];

export function createSections(
  height: number,
  width: number,
  divisions: number
): Sections {
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
  const sections: Sections = [];

  for (let y = 0; y < yCount; y++) {
    sections[y] ||= [];
    for (let x = 0; x < xCount; x++) {
      sections[y][x] = {
        x,
        y,
        start: [(x * width) / xCount, (y * height) / yCount],
        end: [((x + 1) * width) / xCount, ((y + 1) * height) / yCount],
        nearbyByLevel: [],
        piecesByType: {
          rock: [],
          scissor: [],
          paper: [],
        },
      };
    }
  }
  return sections;
}

export function getNearbySections(
  section: Section,
  all: Section[][],
  level: number
) {
  const res: Section[] = [];
  if (level === 0) {
    res.push(section);
  }
  const x = section.x;
  const y = section.y;
  const min = Math.floor(Math.pow(level, 1.7) + 1);
  const max = Math.floor(Math.pow(level + 1, 1.7) + 1);

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

export function getNearbySectionsByLevel(section: Section, all: Sections) {
  const res = [];
  for (let i = 0; true; i++) {
    const arr = getNearbySections(section, all, i);
    if (arr.length === 0) break;
    res.push(arr);
  }
  return res;
}

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
  nearbyByLevel: Sections;
}
