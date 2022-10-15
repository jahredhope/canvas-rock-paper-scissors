import { describe, expect, test } from "vitest";
import { Section } from "./board";
import {
  createSections,
  getNearbySections,
  getNearbySectionsByLevel,
} from "./section";

describe("section", () => {
  test("1", () => {
    const a = createSections(10, 10, 10);
    const thisSection: Section = a[3][5];
    const res = getNearbySections(thisSection, a, 0).map(
      (v) => `(${v.x},${v.y})`
    );
    [
      "(5,2)",
      "(5,3)",
      "(5,4)",
      "(4,2)",
      "(4,3)",
      "(4,4)",
      "(6,2)",
      "(6,3)",
      "(6,4)",
    ].forEach((v) => expect(res).toContain(v));
  });
  test("all", () => {
    const a = createSections(1200, 1200, 24);
    const res = getNearbySectionsByLevel(a[9][9], a);
    expect(res.length).toBe(5);
    expect(res[0].length).toBe(3 * 3);
    expect(res[0].length).toBe(4 * 2 + 1);

    expect(res[1].length).toBe(4 * 4 + 4 * 6);
    expect(res[1].length).toBe(7 * 7 - 3 * 3);

    expect(res[2].length).toBe(13 * 13 - 7 * 7);
    expect(res[2].length).toBe(4 * 8 + 4 * 10 + 4 * 12);
  });
});
