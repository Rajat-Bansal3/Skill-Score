//@ts-nocheck
export function timeToSeconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}
