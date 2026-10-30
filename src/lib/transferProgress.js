export function getProgressPercentage(progressEvent) {
  if (!progressEvent.total) return null;
  return Math.round((progressEvent.loaded / progressEvent.total) * 100);
}
