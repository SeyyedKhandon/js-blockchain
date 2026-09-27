import { readFileSync } from "node:fs";
import { Block } from "./blockchain.ts";

const jsonPath = new URL("../bitcoin-block.json", import.meta.url);
export const bitcoinBlock = JSON.parse(readFileSync(jsonPath, "utf8"));
// console.log("Bitcoin Block:", bitcoinBlock.blockDetails);
// console.log("Bitcoin Block Transactions:", bitcoinBlock.blockTxs);

const block = new Block("2024-01-01", bitcoinBlock.blockTxs, "");
console.log("New Block:", block.nonce, block.hash);
block.mineBlock(4);
console.log("Mined Block:", block.nonce, block.hash);
