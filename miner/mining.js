const MOCKED_EARNING_RATE = 0.0001;

const { spawn } = require("child_process");

let minerProcess = null;
let sessionStartTime = null;

function startMining(walletAddress) {
  if (minerProcess) {
    console.log("Miner already running");
    return;
  }

  sessionStartTime = Date.now();

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
    console.log(`[miner] ${data}`);
  });

  minerProcess.stderr.on("data", (data) => {
    console.error(`[miner error] ${data}`);
  });

  minerProcess.on("exit", () => {
    console.log("Miner stopped");
    minerProcess = null;
    sessionStartTime = null;
  });
}

function stopMining() {
  if (minerProcess) {
    minerProcess.kill("SIGINT");
    console.log("Mining stopped via Node");
    minerProcess = null;
    sessionStartTime = null;
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

module.exports = { startMining, stopMining, getEarningsSoFar };
