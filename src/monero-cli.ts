import moneroTs from "monero-ts";

const daemonUri = process.env.MONERO_DAEMON_URI ?? "http://127.0.0.1:18081";

async function connectDaemon() {
  const daemon = await moneroTs.connectToDaemonRpc(daemonUri);
  return daemon;
}

async function showInfo() {
  const daemon = await connectDaemon();
  const info = await daemon.getInfo();
  console.log("=== Monero Network ===");
  console.log("Height:", info.height.toLocaleString());
  console.log("Synchronized:", info.isSynchronized);
  console.log("Restricted RPC:", info.isRestricted);
  console.log("Difficulty:", info.difficulty.toLocaleString());
  console.log("Target block time:", info.target, "s");
  const hashRate = info.difficulty/BigInt(info.target);
  console.log("Network hash rate:", hashRate.toLocaleString(), "H/s");
  console.log("Mempool transactions:", info.numTxsPool);
  console.log("Total transactions:", info.numTxs.toLocaleString());
  console.log("Top block hash:", info.topBlockHash);
}

async function showBlock(height: number) {
  const daemon = await connectDaemon();
  const block = await daemon.getBlockByHeight(height);
  console.log("===  Block ===");
  console.log("Height:", block.height.toLocaleString());
  console.log("Hash:", block.hash);
  console.log("Previous hash:", block.prevHash);
  const date = new Date(block.timestamp*1000).toISOString();
  console.log("Timestamp:", block.timestamp.toLocaleString(), " = Date => ", date);
  const hashRate = block.difficulty/120n;
  console.log("Difficulty:", block.difficulty.toLocaleString());
  console.log("Network hash rate:", hashRate.toLocaleString(), "H/s");
  const rewardXmr = Number(block.reward)/1_000_000_000_000;
  console.log("Reward:", block.reward.toLocaleString(), "atomic units    = XMR =>    ", rewardXmr, "XMR");
  console.log("Regular transactions:", block.txHashes.length);
}


async function showTx(hash: string) {
  const daemon = await connectDaemon();
  const txs = await daemon.getTxs([hash], false);
  if (!txs.length) {
    console.log("Error: transaction not found");
    return;
  }
  const tx = txs[0];
  console.log("=== Transaction ===");
  console.log("Hash:", tx.hash);
  console.log("Confirmed:", tx.isConfirmed);
  console.log("In tx pool:", tx.inTxPool);
  console.log("Block height:", tx.block?.height.toLocaleString());
  console.log("Confirmations:", tx.numConfirmations?.toLocaleString() ?? 0);
  const fee = Number(tx.fee)/1_000_000_000_000;
  console.log("Fee:", tx.fee.toLocaleString(), "atomic units    = XMR =>    ", fee, "XMR");
  console.log("Inputs:", tx.inputs?.length);
  console.log("Outputs:", tx.outputs?.length);
} 

async  function showMempool() {
  const daemon = await connectDaemon();
  const txs = await daemon.getTxPool();
  if (!txs.length) {
    console.log("=== Mempool ===");
    console.log("Transaction: 0");
    console.log("Mempool is empty");
    return;
  }

  console.log("=== Mempool ===");
  console.log("Transactions:", txs.length);
  const totalWeight =  txs.reduce((sum, tx) => {
    return sum + (tx.weight ?? 0);
  },0);
  console.log("Total weight:", totalWeight.toLocaleString());
  const totalFees = txs.reduce((sum, tx) => {
    return sum + (tx.fee ?? 0n);
  }, 0n);
  const fee =Number(totalFees)/1_000_000_000_000;
  console.log("Total fees:", totalFees.toLocaleString(), "atomic units    = XMR =>    ", fee, "XMR");
  console.log("");
  console.log("");
  console.log("Top5 transactions by fee / weight:");
  console.log(""); 

  const summaries = txs.map((tx) => {  
    return{
      hash: tx.hash,
      fee: tx.fee,     
      weight: tx.weight,
      feePerWeight: tx.weight && tx.fee !== undefined ? Number(tx.fee)/tx.weight: 0
    };
  });   

  const sort = summaries.sort((a, b) => {  
    return b.feePerWeight - a.feePerWeight;
  });

  sort.slice(0, 5).forEach((top, position) => {
    console.log(position + 1, ".");
    console.log("Hash:", top.hash);
    const topFee = Number(top.fee) / 1_000_000_000_000;
    console.log("Fee:", top.fee.toLocaleString(), "atomic units    = XMR =>    ", topFee, "XMR");
    console.log("Weight:", top.weight);
    console.log("Fee per weight:", top.feePerWeight.toLocaleString(), "atomic units / weight");
    console.log("");
  });

}


async function main() {

  try {

    const command = process.argv[2];

    if (!command) {
      console.log("Usage:");
      console.log("  monero-cli.ts info");
      console.log("  monero-cli.ts block <height>");
      console.log("  monero-cli.ts tx <hash>");
      console.log("  monero-cli.ts mempool");
      return;
    }

    switch (command) {

      case "info":
        await showInfo();
        break;

      case "block": {
        const argument = process.argv[3];
      
        if (!argument) {
          console.log("Error: block height is required");
          return;
        } 

        const number = Number(argument);
  
        if (!Number.isInteger(number) || number < 0) {
          console.log("Error: invalid block height");
          return;
        }

        await showBlock(number); 
        break;
      }

      case "tx": {
        const argument = process.argv[3];
      
        if (!argument) {
          console.log("Error: transaction hash is required");
          return;
        }
      
        const hashPattern = /^[0-9a-fA-F]{64}$/;

        if (!hashPattern.test(argument)) {
          console.log("Error: invalid transaction hash");
          return;
        }

        await showTx(argument);
        break;
      }

      case "mempool": {
        await showMempool();
        break;
      }

      default:
        console.log("Unknown command:", command);
        break;

    }

  } finally {
    await moneroTs.shutdown();
  }
}

main().catch((error) => {
  console.error(error);
});
