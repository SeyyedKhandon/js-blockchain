import sha256 from "crypto-js/sha256.js";

/**
 * A Block has:
 * - Transactions: string[]
 * - Hash of previous block
 * - Hash of current block
 * - Timestamp
 * - Nonce for proof of work mining
 * - Mine the block
 */
class Block {
  timestamp: string;
  transactions: string[];
  previousHash: string;
  hash: string;
  nonce: number;
  constructor(
    timestamp: string,
    transactions: string[],
    previousHash: string = ""
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash; // This should get updated inside the blockchain class through addBlock fn
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash() {
    return sha256(
      this.timestamp +
        this.transactions.join("") +
        this.previousHash +
        this.nonce
    ).toString();
  }

  mineBlock(previousHash: string, difficulty: number) {
    // Connect to the previous block
    this.previousHash = previousHash;

    // A valid hash, needs to start with difficultyPrefix, and the process of finding a nonce which results in the correct hash, is called mining!
    const difficultyPrefix = "0".repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== difficultyPrefix) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

/**
 * A Blockchain has:
 * - Chain of blocks: Block[]
 * - Mining Difficulty
 * - Genesis block generator
 * - Chain verifier
 * - Add new block
 * - Get last block
 */
class BlockChain {
  chain: Block[];
  difficulty: number;
  constructor() {
    this.chain = [this.generateGenesisBlock()];
    this.difficulty = 4;
  }
  generateGenesisBlock() {
    return new Block("19/09/2025", [], "Genesis Block");
  }
  getLastBlock() {
    return this.chain.at(-1)!;
  }
  addBlock(newBlock: Block) {
    // Connect the new block to the previous block
    newBlock.mineBlock(this.getLastBlock().hash, this.difficulty);
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
console.log("Blockchain Started: ", blockchain);

// Mining of first block
blockchain.addBlock(new Block("2/2/2025", ["tr1"]));
console.log("\r\n New Block", blockchain.getLastBlock());

// Mining of second block
blockchain.addBlock(new Block("3/3/2025", ["tr2"]));
console.log("\r\n New Block", blockchain.getLastBlock());

console.log("\r\n Overview:", {
  isBlockchainValid: blockchain.isChainValid(),
  blockchain,
});
