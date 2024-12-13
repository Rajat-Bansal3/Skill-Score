const WHITE: { [key: string]: number } = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
  K: 0,
};
const BLACK: { [key: string]: number } = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};
const CONDITIONS: { [key: string]: number } = {};
export const scoreFEN = (fen: string) => {
  let black = 0;
  let white = 0;
  const position = fen.split(" ")[0];
  const rows = position!.split("/");
  for (const row of rows) {
    for (const c of row) {
      if (c >= "1" && c <= "8") {
        continue;
      }
      white += WHITE[c] || 0;
      black += BLACK[c] || 0;
    }
  }
  return { black, white };
};
