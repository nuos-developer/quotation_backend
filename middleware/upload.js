const multer = require("multer");
const path = require("path");

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

// Store images inside /uploads/products/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/products");
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new Error("Only image uploads (jpeg, png, webp, gif) are allowed"));
        }
        cb(null, true);
    }
});

module.exports = upload;
