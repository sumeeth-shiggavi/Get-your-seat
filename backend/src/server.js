require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("PostgreSQL connection verified");

    app.listen(PORT, () => {
      console.log(
        `GET YOUR SEAT backend running on port ${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "Unable to connect to PostgreSQL:"
    );

    console.error(error);

    process.exit(1);
  }
};

startServer();