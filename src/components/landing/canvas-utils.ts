/**
 * Pure math and array utilities for the WaitingRoomCanvas crowd sprite system.
 * Extracted for pure execution and automated unit testing.
 */

export function randomRange(min: number, max: number, randomFn = Math.random): number {
  return min + randomFn() * (max - min);
}

export function randomIndex(arrayLength: number, randomFn = Math.random): number {
  if (arrayLength <= 0) return 0;
  return Math.floor(randomFn() * arrayLength);
}

export function removeFromArray<T>(array: T[], index: number): T | undefined {
  if (index < 0 || index >= array.length) return undefined;
  return array.splice(index, 1)[0];
}

export function removeItemFromArray<T>(array: T[], item: T): T | undefined {
  const index = array.indexOf(item);
  if (index === -1) {
    return undefined; // Guard against removing last item when index is -1
  }
  return array.splice(index, 1)[0];
}

export function removeRandomFromArray<T>(array: T[], randomFn = Math.random): T | undefined {
  if (array.length === 0) return undefined;
  const idx = randomIndex(array.length, randomFn);
  return removeFromArray(array, idx);
}

export function getRandomFromArray<T>(array: T[], randomFn = Math.random): T | undefined {
  if (array.length === 0) return undefined;
  const idx = randomIndex(array.length, randomFn);
  return array[idx];
}

export function calculateSpriteRects(
  imgWidth: number,
  imgHeight: number,
  rows: number,
  cols: number
): Array<[number, number, number, number]> {
  if (rows <= 0 || cols <= 0 || imgWidth <= 0 || imgHeight <= 0) return [];
  const total = rows * cols;
  const rectWidth = imgWidth / rows;
  const rectHeight = imgHeight / cols;
  const rects: Array<[number, number, number, number]> = [];

  for (let i = 0; i < total; i++) {
    const colIndex = i % rows;
    const rowIndex = Math.floor(i / rows);
    rects.push([
      colIndex * rectWidth,
      rowIndex * rectHeight,
      rectWidth,
      rectHeight,
    ]);
  }

  return rects;
}
