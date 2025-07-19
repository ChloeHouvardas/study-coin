const express = require("express");
const { WebSocketServer } = require("ws");
const {
  startMining,
  stopMining,
  getEarningsSoFar,
  getCulmTransactions,
  getHashrate,
} = require("./mining");

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

app.get("/hashrate", (req, res) => {
  res.json({ hashrate_hs: getHashrate() });
});

app.get("/transactions", (req, res) => {
  const txns = getCulmTransactions();
  res.json({ culumative_txns: txns });
});

app.listen(3001, () => {
  console.log("Miner backend running at http://localhost:3001");
});

const wss = new WebSocketServer({ port: 3002 });

wss.on("connection", (ws) => {
  console.log("Websocket client connected");

  const interval = setInterval(() => {
    const earnings = getEarningsSoFar();
    const txns = getCulmTransactions();
    const hashRate = getHashrate();

    ws.send(JSON.stringify({ usd: earnings, txns, hashRate: hashRate }));

    if (ws.readyState !== ws.OPEN) {
      clearInterval(interval);
    }
  }, 1000);

  ws.on("close", () => {
    console.log("Websocket client disconnected");
    clearInterval(interval);
  });
});
