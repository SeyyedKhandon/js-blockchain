import sha256 from "crypto-js/sha256.js";

/**
 * A Block has:
 * - Transactions: string[]
 * - Hash of previous block
 * - Hash of current block
 * - Timestamp
 */
class Block {
  timestamp: string;
  transactions: string[];
  previousHash: string;
  hash: string;
  constructor(
    timestamp: string,
    transactions: string[],
    previousHash: string = ""
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash; // This should get updated inside the blockchain class through addBlock fn
    this.hash = this.calculateHash();
  }
  calculateHash() {
    return sha256(
      this.timestamp + this.transactions.join("") + this.previousHash
    ).toString();
  }
  setPreviousHash(value: string) {
    // Connect to the previous block
    this.previousHash = value;
    // Update the hash of the block
    this.hash = this.calculateHash();
  }
}

/**
 * A Blockchain has:
 * - Chain of blocks: Block[]
 * - Genesis block generator
 * - Chain verifier
 * - Add new block
 * - Get last block
 */
class BlockChain {
  chain: Block[];
  constructor() {
    this.chain = [this.generateGenesisBlock()];
  }
  generateGenesisBlock() {
    return new Block("19/09/2025", [], "0");
  }
  getLastBlock() {
    return this.chain.at(-1)!;
  }
  addBlock(newBlock: Block) {
    // Connect the new block to the previous block
    newBlock.setPreviousHash(this.getLastBlock().hash);
    // Add to the chain
    this.chain.push(newBlock);
  }
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      // Check if the block have not been tampered
      const isTampered = currentBlock.hash !== currentBlock.calculateHash();
      // Check if block are connected properly to the previous block
      const isConnectedCorrectly =
        currentBlock.previousHash === previousBlock.hash;
      if (isTampered || !isConnectedCorrectly) {
        console.log("Blockchain is not valid!", {
          isTampered,
          isConnectedCorrectly,
          currentBlock,
          previousBlock,
        });
        return false;
      }
    }
    return true;
  }
}

const blockchain = new BlockChain();
console.log("New Blockchain", blockchain);

blockchain.addBlock(new Block("2/2/2025", ["tr1"]));
blockchain.addBlock(new Block("3/3/2025", ["tr2"]));

console.log("Used Blockchain", blockchain);
blockchain.isChainValid();

// tamper the blockchain to check the isChainValid
blockchain.chain[1].transactions = ["tr33"];
blockchain.isChainValid();
