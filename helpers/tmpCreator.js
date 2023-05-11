import fs from "node:fs/promises";

const isAccessible = (dir) =>
  fs
    .access(dir)
    .then(() => true)
    .catch(() => false);

export const initDirectory = async (dir) => {
  if (await isAccessible(dir)) return;

  console.log(`Directory '${dir}' initialized on first run`);
  await fs.mkdir(dir);
};
