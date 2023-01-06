export function createRate(callback: (v: number) => void) {
  let count = 0;
  let lastValue = 0;
  let lastMeasure = performance.now();
  setInterval(() => {
    const newMeasure = performance.now();
    lastValue = Math.round((count * 1000) / (newMeasure - lastMeasure));
    if (lastValue) callback(lastValue);
    count = 0;
    lastMeasure = newMeasure;
  }, 1000);
  return () => {
    count++;
  };
}
