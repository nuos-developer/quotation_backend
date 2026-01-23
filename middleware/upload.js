const multer = require("multer");
const path = require("path");

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

const upload = multer({ storage });

module.exports = upload;
