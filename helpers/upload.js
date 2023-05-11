import multer from "multer";
import { join } from "node:path";

const uploadDir = join(process.cwd(), "tmp");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const date = Date.now();
    const fileName = [date, file.originalname].join("_");
    callback(null, fileName);
  },
  limits: {
    fileSize: 1048576,
  },
});

export const upload = multer({ storage: storage });
