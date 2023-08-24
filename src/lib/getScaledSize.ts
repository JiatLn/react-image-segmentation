export function getScaledSize(x: number, y: number, max: number = 500): [number, number] {
  // Determine the scale factor
  const scaleFactor = Math.min(max / x, max / y);

  // Calculate the new dimensions
  let scaledX = Math.round(x * scaleFactor);
  let scaledY = Math.round(y * scaleFactor);

  // Ensure neither dimension exceeds max
  scaledX = Math.min(scaledX, max);
  scaledY = Math.min(scaledY, max);

  return [scaledX, scaledY];
}
