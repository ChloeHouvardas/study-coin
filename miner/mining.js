const { spawn } = require("child_process");

let minerProcess = null;

function startMining(walletAddress) {
  if (minerProcess) {
    console.log("Miner already running");
    return;
  }

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
  });
}

function stopMining() {
  if (minerProcess) {
    minerProcess.kill("SIGINT");
    console.log("Mining stopped via Node");
    minerProcess = null;
  } else {
    console.log("Miner is not running.");
  }
}

module.exports = { startMining, stopMining };
