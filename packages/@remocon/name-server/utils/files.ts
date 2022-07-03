import fs from 'fs';

export const searchFilePath = (pathList: string[]) => {
  return pathList.find((targetPath) => fs.existsSync(targetPath));
};
