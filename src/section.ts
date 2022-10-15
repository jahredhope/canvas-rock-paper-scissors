import { Section } from "./board";
import { Point } from "./point";

export function createSections(
  height: number,
  width: number,
  divisions: number
) {
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
  const sections: Section[][] = [];
  for (let y = 0; y < yCount; y++) {
    sections[y] ||= [];
    for (let x = 0; x < xCount; x++) {
      sections[y][x] = {
        x,
        y,
        start: {
          x: (x * width) / xCount,
          y: (y * height) / yCount,
        },
        end: {
          x: ((x + 1) * width) / xCount,
          y: ((y + 1) * height) / yCount,
        },
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
    const v = all[p.y]?.[p.x];
    return v;
  };
  for (let i = min; i < max; i++) {
    for (let j = 0; j < i * 2; j++) {
      res.push(getFromAll({ y: y - i, x: x - i + j }));
      res.push(getFromAll({ y: y + i - j, x: x - i }));
      res.push(getFromAll({ y: y - i + j, x: x + i }));
      res.push(getFromAll({ y: y + i, x: x + i - j }));
    }
  }
  return res.filter((v) => {
    return Boolean(v);
  });
}

export function getNearbySectionsByLevel(section: Section, all: Section[][]) {
  const res = [];
  for (let i = 0; true; i++) {
    const arr = getNearbySections(section, all, i);
    if (arr.length === 0) break;
    res.push(arr);
  }
  return res;
}
