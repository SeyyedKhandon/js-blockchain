import sha256 from "crypto-js/sha256.js";
import {
  Secp256k1CurveECDSAKeyGenerator,
  generateECDSAKey,
  type KeyPair,
} from "./walletKeyGenerator.ts";

/**
 * - Sender address
 * - Receiver Address
 * - Amount
 * - Message
 * - Signature
 */
export class Transaction {
  sender: string | null;
  receiver: string;
  amount: number;
  message: string;
  signature: string;
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
    this.signature = "";
  }
  calculateHash() {
    return sha256(
      this.sender + this.receiver + this.amount + this.message
    ).toString();
  }

  sign(keyPair: KeyPair) {
    const publicKey = keyPair.getPublic("hex");
    if (publicKey !== this.sender)
      throw new Error("You cannot sign transactions for other wallets!");

    // Sign the hash using private key
    const txHash = this.calculateHash();
    const signature = keyPair.sign(txHash, "base64");
    this.signature = signature.toDER("hex");
  }

  isValid() {
    // Some transactions (like coinbase transactions in blockchains aka miner reward) don’t have a sender — they just mint new coins.
    if (this.sender === null) return true;
    if (!this.signature) throw new Error("No signature found!");

    const publicKeyPair = Secp256k1CurveECDSAKeyGenerator.keyFromPublic(
      this.sender,
      "hex"
    );

    return publicKeyPair.verify(this.calculateHash(), this.signature);
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

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) return false;
    }
    return true;
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
    const transactions = [...this.pendingTransactions, rewardTransaction];
    const newBlock = new Block(timestamp, transactions, previousHash);

    // Connect the new block to the previous block
    newBlock.mineBlock(this.difficulty);

    // Add to the chain
    this.chain.push(newBlock);
    // remove mined transactions
    this.pendingTransactions = [];
  }

  addTransaction(transaction: Transaction) {
    if (this.isTransactionValid(transaction))
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

  isTransactionValid(transaction: Transaction) {
    if (!transaction.sender || !transaction.receiver)
      throw new Error("Transactions must have sender and receiver address!");
    if (!transaction.isValid())
      throw new Error("Cannot add invalid transaction to the blockchain!");

    const senderBalance = this.getBalanceOfAddress(transaction.sender);
    if (transaction.amount < senderBalance) return true;
    return false;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if all transactions are signed and valid
      if (!currentBlock.hasValidTransactions()) return false;

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
