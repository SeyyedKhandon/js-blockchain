import sha256 from "crypto-js/sha256.js";
import { generateECDSAKey } from "./walletKeyGenerator.ts";

/**
 * - Sender address
 * - Receiver Address
 * - Amount
 * - Message
 */
export class Transaction {
  sender: string | null;
  receiver: string;
  amount: number;
  message: string;
  constructor(
    sender: string | null,
    receiver: string,
    amount: number,
    message: string = ""
  ) {
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
    this.message = message;
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }
}

/**
 * A Block has:
 * - Transactions: Transaction[]
 * - Hash of previous block
 * - Hash of current block
 * - Timestamp
 * - Nonce for proof of work mining
 * - Mine the block
 */
export class Block {
  timestamp: string;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  constructor(
    timestamp: string,
    transactions: Transaction[],
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
        JSON.stringify(this.transactions.toString()) +
        this.previousHash +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty: number) {
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
 * - Pending transactions
 * - Mining rewards
 * - Mining Difficulty
 * - Genesis block generator
 * - Chain verifier
 * - Mine pending transactions
 * - Get last block
 * - Add transaction
 * - Get balance of an address
 * - Verify transaction
 * - Is chain valid
 */
export class BlockChain {
  chain: Block[];
  difficulty: number;
  miningReward: number;
  pendingTransactions: Transaction[];

  constructor() {
    this.chain = [this.generateGenesisBlock()!];
    this.difficulty = 4;
    this.miningReward = 100;
    this.pendingTransactions = [];
  }

  generateGenesisBlock() {
    if (this.chain !== undefined) return; // Run genesis only once
    const satoshiWallet = generateECDSAKey();
    const genesisTransaction = new Transaction(
      null,
      satoshiWallet.publicKey,
      1000,
      "Genesis reward for the developer"
    );
    return new Block("19/09/2025", [genesisTransaction], "Genesis Block");
  }
  getLastBlock() {
    return this.chain.at(-1)!;
  }

  minePendingTransactions(minerAddress: string) {
    // Miner address is to send the reward to the miner who successfully mined the block
    const rewardTransaction = new Transaction(
      null,
      minerAddress,
      this.miningReward,
      "Miner reward"
    );

    const timestamp = new Date().toISOString();
    const previousHash = this.getLastBlock().hash;
    const transactions = [...this.pendingTransactions].filter((tx) =>
      this.verifyTransaction(tx)
    ); // Remove invalid transactions

    const newBlock = new Block(
      timestamp,
      [...transactions, rewardTransaction],
      previousHash
    );

    // Connect the new block to the previous block
    newBlock.mineBlock(this.difficulty);

    // Add to the chain
    this.chain.push(newBlock);
    // remove mined transactions
    this.pendingTransactions = [];
  }

  addTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address: string) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.sender === address) balance -= transaction.amount;
        if (transaction.receiver === address) balance += transaction.amount;
      }
    }
    return balance;
  }

  verifyTransaction(transaction: Transaction) {
    if (!transaction.sender) return false;

    const senderBalance = this.getBalanceOfAddress(transaction.sender);
    if (transaction.amount < senderBalance) return true;
    return false;
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

  toString() {
    return JSON.stringify(this, null, 2);
  }
}
