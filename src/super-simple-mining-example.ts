import CryptoJS from "crypto-js";
const { SHA256 } = CryptoJS;

/**
 * A minimal, standalone Block/BlockChain example (no transactions, wallets,
 * or proof-of-work) kept for reference alongside the full implementation
 * in blockchain.ts.
 */

/**
 * A block has at-least
 *  timestamp: string;
    transactions: string[];
    previousHash: string;
    hash: string;
 */
class Block {
  timestamp: string;
  transactions: string[];
  previousHash: string;
  hash: string;
  constructor(timestamp: string, previousHash: string, transactions: string[]) {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.hash = this.calculateHash();
  }
  calculateHash() {
    return SHA256(
      this.timestamp + this.previousHash + this.transactions.join("")
    ).toString();
  }
}

/**
 * A Blockchain has at-least
 * A chain, a genesis block, getLastBlock, addBlock, isChainValid
 */

class BlockChain {
  chain: Block[];
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }
  createGenesisBlock() {
    return new Block("2025", "0", ["Gensis Block"]);
  }
  getLastBlock() {
    return this.chain.at(-1)!;
  }
  addBlock(newBlock: Block) {
    newBlock.previousHash = this.getLastBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const previousBlock = this.chain[i - 1];
      const currentBlock = this.chain[i];
      if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
    }
    return true;
  }
}

const blockchain = new BlockChain();
console.log("New Blockchain", blockchain);

blockchain.addBlock(new Block("2/2/2025", "pre1", ["tr1"]));
blockchain.addBlock(new Block("3/3/2025", "pre2", ["tr2"]));

console.log("Used Blockchain", blockchain);

// tamper the blockchain to check the isChainValid
blockchain.chain[1].transactions = ["tr33"];
console.log(blockchain.isChainValid());
