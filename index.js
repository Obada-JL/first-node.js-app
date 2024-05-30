// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const app = express();
// const mongoose = require("mongoose");
// const url = process.env.MONGO_URL;
// mongoose.connect(url).then(() => {
//   console.log("mongodb connected successfuly");
// });
// const { body, validationResult } = require("express-validator");
// app.use(cors());
// app.use(express.json());
// const coursesController = require("./controllers/controllers");
// const userController = require("./controllers/userControllers");

// app.all("*", (req, res, next) => {
//   return res.status(404).json({ res });
// });

// app.listen(process.env.PORT || 4000, () => {
//   console.log("listening on port " + process.env.PORT);
// });
// app.get("/api/lessons", coursesController.getLessons);
// app.get("/api/lessons/:courseId", coursesController.getLesson);
// app.post(
//   "/api/lessons",
//   body("title")
//     .notEmpty()
//     .withMessage("title is required")
//     .isLength((min = 5))
//     .withMessage("title is min 5 digits"),
//   coursesController.postLesson
// );
// app.patch("/api/lessons/:courseId", coursesController.editLesson);
// app.delete("/api/lessons/:courseId", coursesController.deleteLesson);

// app.get("/api/users", userController.getAllUsers);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { body } = require("express-validator");
const verifyToken = require("./verifyToken");
const app = express();
const url = process.env.MONGO_URL;
const path = require("path");
const multer = require("multer");
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(new CustomError(400, "Data must be a string"), false);
  }
};
const upload = multer({ storage: diskStorage, fileFilter });
// Connect to MongoDB
mongoose
  .connect(url)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const coursesController = require("./controllers/controllers");
const userController = require("./controllers/userControllers");
const allowedTo = require("./allowedTo");
const { error } = require("console");

// Define routes
app.get("/api/lessons", coursesController.getLessons);
app.get("/api/lessons/:courseId", coursesController.getLesson);
app.post(
  "/api/lessons",
  verifyToken,
  allowedTo("ADMIN", "MANAGER"),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long"),
  coursesController.postLesson
);
app.patch("/api/lessons/:courseId", coursesController.editLesson);
app.delete(
  "/api/lessons/:courseId",
  verifyToken,
  allowedTo("ADMIN", "MANAGER"),
  coursesController.deleteLesson
);

app.get("/api/users", verifyToken, userController.getAllUsers);
app.post(
  "/api/users/register",
  upload.single("avatar"),
  userController.register
);
app.post("/api/users/signIn", userController.login);

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
