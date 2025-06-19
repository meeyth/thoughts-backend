import multer from "multer";
import fs from "fs";
import path from "path";

const TEMP_DIR = path.join(__dirname, "..", "public", "temp");

// Create the folder if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, TEMP_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

export const upload = multer({ storage });
