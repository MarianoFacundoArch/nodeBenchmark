const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const cluster = require("cluster");
const root = path.dirname(__dirname);
const cCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  // Create a worker for each CPU
  for (var i = 0; i < cCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online.");
  });
  cluster.on("exit", function (worker, code, signal) {
    console.log("worker " + worker.process.pid + " died.");
  });
} else {
  var app = express();

  app.get("/benchmark", async (req, res) => {
    const textContent = await fs.readFile(
      path.join(__dirname, "../contentFile"),
      "utf8",
      (err, data) => {
        const processedData = crypto
          .createHash("sha256")
          .update(data)
          .digest("base64");
        res.send({ content: processedData });
      }
    );
  });

  app.listen(3000);
}
