import moneroTs from "monero-ts";

import {
  atomicUnitsToXmr,
  isValidHash,
  parseBlockHeight,
  toGlobalIndices  
} from "./utils.js";

import {
  connectDaemon,
  getOuts
} from "./rpc.js";



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
  console.log("Reward:", block.reward.toLocaleString(), "atomic units    = XMR =>    ", atomicUnitsToXmr(block.reward), "XMR");
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
  const fee = tx.fee ?? 0n;
  console.log("Fee:", fee.toLocaleString(), "atomic units    = XMR =>    ", atomicUnitsToXmr(fee), "XMR");
  console.log("Inputs:", tx.inputs?.length);
  for (const [inputPosition, input] of (tx.inputs ?? []).entries()) {
    const offsets = input.ringOutputIndices ?? [];
    const globalIndices = toGlobalIndices(offsets);

    console.log("");
    console.log("-------- Input ", inputPosition + 1," -----------");
    console.log("Key image:", input.keyImage?.hex);
    console.log("Ring size:", offsets.length);
    console.log("");
    console.log("Ring members:");
    const response = await getOuts(globalIndices);
    response.outs.forEach((out, position) => {
      console.log(out.txid);
    });
    console.log("");
    console.log("Pseudo output:", tx.rctSigPrunable?.pseudoOuts?.[inputPosition]);
    console.log("------------------------------");
  }

  console.log("");
  console.log("");
  console.log("Outputs:", tx.outputs?.length);

  tx.outputs?.forEach((output, outputPosition) => {
    console.log("");
    console.log("-------- Output ", outputPosition + 1," -----------");
    console.log("One-time public key:", output.stealthPublicKey);
    console.log("Global output index:", output.index);
    console.log("Commitment:", tx.rctSignatures?.outPk?.[outputPosition]);
    console.log("Encrypted amount:", tx.rctSignatures?.ecdhInfo?.[outputPosition]?.amount);
    console.log("-------------------------------");
  });

  const extra = tx.extra ?? [];
  console.log("");
  console.log("");
  if (extra.length >= 33 && extra[0] === 1) {
    const txPublicKey = Buffer.from(extra.slice(1, 33)).toString("hex");
    console.log("Transactin public key:", txPublicKey);
  }

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
  console.log("Total fees:", totalFees.toLocaleString(), "atomic units    = XMR =>    ", atomicUnitsToXmr(totalFees), "XMR");
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

  const sortedSummaries = summaries.sort((a, b) => {  
    return b.feePerWeight - a.feePerWeight;
  });

  sortedSummaries.slice(0, 5).forEach((top, position) => {
    console.log(position + 1, ".");
    console.log("Hash:", top.hash);
    console.log("Fee:", top.fee.toLocaleString(), "atomic units    = XMR =>    ", atomicUnitsToXmr(top.fee), "XMR");
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

        const height = parseBlockHeight(argument);
  
        if (height === undefined) {
          console.log("Error: invalid block height");
          return;
        }

        await showBlock(height); 
        break;
      }

      case "tx": {
        const argument = process.argv[3];
      
        if (!argument) {
          console.log("Error: transaction hash is required");
          return;
        }

        if (!isValidHash(argument)) {
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
