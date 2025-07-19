const MOCKED_EARNING_RATE = 0.0001;

const { spawn } = require("child_process");
const fetch = require("node-fetch");

let minerProcess = null;
let sessionStartTime = null;
let culmTxns = null;
let hashRate = 0;

async function sendWebhook(data) {
  try {
    const res = await fetch("http://localhost:3005/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log(`Webhook status: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error("Webhook failed:", err.message);
  }
}

function startMining(walletAddress) {
  if (minerProcess) {
    console.log("Miner already running");
    return;
  }

  sessionStartTime = Date.now();
  culmTxns = 0;

  minerProcess = spawn("./xmrig", [
    "-o",
    "pool.supportxmr.com:3333",
    "-u",
    walletAddress,
    "-p",
    "x",
    "--threads=1",
    "--cpu-priority=1",
  ]);

  console.log("Miner started");

  minerProcess.stdout.on("data", (data) => {
    const text = data.toString();

    const speedMatch = text.match(/speed.*?(\d+\.\d+)/);
    if (speedMatch) {
      hashRate = parseFloat(speedMatch[1]);
      console.log(`Hashrate: ${hashRate} H/s`);
    }
    //regex below matches patterns like (11 tx)
    const txtMatch = text.match(/\((\d+)\s*tx\)/);
    if (txtMatch) {
      const txnsInBlock = parseInt(txtMatch[1]);
      culmTxns += txnsInBlock;
      console.log(`[+${txnsInBlock} tx] → total: ${culmTxns}`);
    }
    const jobMatch = text.match(/new job from .*? height (\d+)/);
    if (jobMatch) {
      const blockHeight = parseInt(jobMatch[1]);
      console.log(`New mining job at block height ${blockHeight}`);

      sendWebhook({
        event: "new_block_job",
        height: blockHeight,
        timestamp: Date.now(),
      });
    }

    console.log(`[miner] ${data}`);
  });

  minerProcess.stderr.on("data", (data) => {
    console.error(`[miner error] ${data}`);
  });

  minerProcess.on("exit", () => {
    console.log("Miner stopped");
    minerProcess = null;
    sessionStartTime = null;
    culmTxns = 0;
  });
}

function stopMining() {
  if (minerProcess) {
    minerProcess.kill("SIGINT");
    console.log("Mining stopped via Node");
    minerProcess = null;
    sessionStartTime = null;
    culmTxns = 0;
  } else {
    console.log("Miner is not running.");
  }
}

function getEarningsSoFar() {
  if (!sessionStartTime) return 0;

  const elapsedSeconds = (Date.now() - sessionStartTime) / 1000;

  const earningsUsd = elapsedSeconds * MOCKED_EARNING_RATE;

  return earningsUsd.toFixed(6);
}

function getCulmTransactions() {
  return culmTxns;
}

function getHashrate() {
  return hashRate;
}

module.exports = {
  startMining,
  stopMining,
  getEarningsSoFar,
  getCulmTransactions,
  getHashrate,
};
