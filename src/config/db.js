const { connect } = require("mongoose");

async function connectDB() {
  try {
    await connect(process.env.db_url);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("error in db connection", error);
    //means an error occured
    process.exit(1);
  }
}

module.exports = connectDB