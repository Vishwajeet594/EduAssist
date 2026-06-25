const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || process.env.MONGODB_URI;

    const mongoDnsServers =
      process.env.MONGO_DNS_SERVERS;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI (or MONGODB_URI) is not set"
      );
    }

    if (mongoDnsServers) {
      const servers = mongoDnsServers
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

      if (servers.length > 0) {
        dns.setServers(servers);
      }
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(
      `MongoDB connection error: ${error.message}`
    );
    process.exit(1);
  }
};

module.exports = connectDB;