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
  constructor(timestamp: string, transactions: string[], previousHash: string) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }
  calculateHash() {
    return sha256(
      this.timestamp + this.transactions.join("") + this.previousHash
    ).toString();
  }
}
