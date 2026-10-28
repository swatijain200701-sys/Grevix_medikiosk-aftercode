import { describe, it, expect } from "vitest";
import {
  randomRange,
  randomIndex,
  removeFromArray,
  removeItemFromArray,
  removeRandomFromArray,
  getRandomFromArray,
  calculateSpriteRects,
} from "../src/components/landing/canvas-utils";

describe("WaitingRoomCanvas Pure Utils", () => {
  it("computes randomRange within expected bounds", () => {
    expect(randomRange(10, 20, () => 0)).toBe(10);
    expect(randomRange(10, 20, () => 1)).toBe(20);
    expect(randomRange(10, 20, () => 0.5)).toBe(15);
  });

  it("safely indexes arrays with randomIndex", () => {
    expect(randomIndex(10, () => 0.99)).toBe(9);
    expect(randomIndex(10, () => 0)).toBe(0);
    expect(randomIndex(0)).toBe(0);
  });

  it("removes elements by index safely", () => {
    const list = ["a", "b", "c"];
    expect(removeFromArray(list, 1)).toBe("b");
    expect(list).toEqual(["a", "c"]);
    expect(removeFromArray(list, 10)).toBeUndefined();
  });

  it("guards against removeItemFromArray bug when element does not exist", () => {
    const list = ["alpha", "beta", "gamma"];
    const removed = removeItemFromArray(list, "delta");
    expect(removed).toBeUndefined();
    // Guard: ensure the last element was NOT spliced away
    expect(list).toEqual(["alpha", "beta", "gamma"]);
    expect(list.length).toBe(3);
  });

  it("removes item properly when element exists", () => {
    const list = ["alpha", "beta", "gamma"];
    const removed = removeItemFromArray(list, "beta");
    expect(removed).toBe("beta");
    expect(list).toEqual(["alpha", "gamma"]);
  });

  it("calculates accurate sprite grid rects", () => {
    // 3600 x 2268 image with 15 rows, 7 cols
    const rects = calculateSpriteRects(3600, 2268, 15, 7);
    expect(rects.length).toBe(105);
    // First sprite: col 0, row 0, w=240, h=324
    expect(rects[0]).toEqual([0, 0, 240, 324]);
    // Second sprite: col 1, row 0
    expect(rects[1]).toEqual([240, 0, 240, 324]);
    // 16th sprite: col 0, row 1
    expect(rects[15]).toEqual([0, 324, 240, 324]);
  });
});
