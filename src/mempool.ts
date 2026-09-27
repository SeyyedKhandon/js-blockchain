import mempoolJS from "@mempool/mempool.js";
import { wait } from "./utils.ts";
const { bitcoin: btc } = mempoolJS({ hostname: "mempool.space" });

export const MEMPOOL_SPACE_BASE_API = "https://mempool.space/api";

const recentTransactions = await btc.mempool.getMempoolRecent();
console.log("Recent Mempool Transactions:", recentTransactions);

const txDetails = await btc.transactions.getTx({
  txid: recentTransactions[0].txid,
});
console.log("Transaction Details:", txDetails);

const oneOfMinedBlockHash =
  "000000000000000000005e8831ecac08a960a91d5f5cb02dc703da148f7574ec";
const blockDetails = await btc.blocks.getBlock({ hash: oneOfMinedBlockHash });
console.log("Block Details:", blockDetails);

async function fetchAllBlockTxids(blockHash: string) {
  const pageSize = 25;
  const allTxs: Array<any> = [];
  let start_index = 0;

  while (true) {
    const transactions = (await btc.blocks.getBlockTxs({
      hash: blockHash,
      start_index,
    })) as unknown as Array<any>;

    console.log(`Fetched ${transactions.length} transactions...`, transactions);
    await wait(100);

    allTxs.push(...transactions);
    if (transactions.length < pageSize) break;
    start_index += pageSize;
  }
  return allTxs;
}

const blockTxs = await fetchAllBlockTxids(oneOfMinedBlockHash);
console.log("Block Transactions:", blockTxs);

// Write to a file with the name of the block hash in nodejs
import { writeFileSync } from "node:fs";
writeFileSync(
  `./bitcoin-block.json`,
  JSON.stringify({ blockDetails, blockTxs }, null, 2)
);
