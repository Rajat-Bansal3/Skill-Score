import fs from "fs";
const counterFile = "CounterFile.txt";
export const getCounter = (): number => {
  try {
    const data = fs.readFileSync(counterFile, "utf-8");
    return parseInt(data, 10) || 0;
  } catch (err) {
    return 0;
  }
};

export const saveCounter = (count: number): void => {
  fs.writeFileSync(counterFile, count.toString(), "utf-8");
};
