const express = require("express");
const cors = require("cors");
const collegeDetailsRoutes = require("./routes/collegeDetailsRoutes");
const examRoutes = require("./routes/examRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const predictorRoutes = require("./routes/predictorRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/exams", examRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/predict", predictorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/college-details", collegeDetailsRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GET YOUR SEAT backend is running",
  });
});

module.exports = app;