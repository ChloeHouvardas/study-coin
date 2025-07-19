const express = require("express");
const { startMining, stopMining, getEarningsSoFar } = require("./mining");

const app = express();
app.use(express.json());
const WALLET =
  "49m7BWytx8rbjwVi1U4EmBcjgLD3wnPG5NLZmH3nKqccQ9TQo6DBkhYS3g6Joop7rJAVmTswWCLVS9CwkC3SxeRZ5znQpkY";

app.post("/start-session", (req, res) => {
  startMining(WALLET);
  res.json({ status: "Mining started" });
});

app.post("/end-session", (req, res) => {
  stopMining();
  res.json({ status: "Mining stopped" });
});

app.get("/earnings", (req, res) => {
  const earnings = getEarningsSoFar();
  res.json({ estimated_usd: earnings });
});

app.listen(3001, () => {
  console.log("Miner backend running at http://localhost:3001");
});
