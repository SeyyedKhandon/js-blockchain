import sha256 from "crypto-js/sha256.js";

/**
 * - Sender address
 * - Receiver Address
 * - Amount
 */
class Transaction {
  sender: string | null;
  receiver: string;
  amount: number;
  constructor(sender: string | null, receiver: string, amount: number) {
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
  }
  toString() {
    return this.sender + this.receiver + this.amount;
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
class Block {
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
 * - Add new block
 * - Get last block
 */
class BlockChain {
  chain: Block[];
  difficulty: number;
  miningReward: number;
  pendingTransactions: Transaction[];

  constructor() {
    this.chain = [this.generateGenesisBlock()];
    this.difficulty = 4;
    this.miningReward = 100;
    this.pendingTransactions = [];
  }

  generateGenesisBlock() {
    return new Block("19/09/2025", [], "Genesis Block");
  }
  getLastBlock() {
    return this.chain.at(-1)!;
  }

  minePendingTransactions(minerAddress: string) {
    // Miner address is to send the reward to the miner who successfully mined the block
    const rewardTransaction = new Transaction(
      null,
      minerAddress,
      this.miningReward
    );

    const newBlock = new Block(
      Date.now().toLocaleString(), // timestamp
      [...this.pendingTransactions, rewardTransaction], // transactions
      this.getLastBlock().hash // previous hash
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

const antMinerAddress = "addr1";
const user2Address = "addr2";
const user3Address = "addr3";

// Add a transaction to the pending transactions(mempool) of the blockchain
blockchain.addTransaction(new Transaction(antMinerAddress, user2Address, 10));
blockchain.addTransaction(new Transaction(user2Address, user3Address, 3));

// Start the mining process inside the antMiner to min the block with the pending transactions
blockchain.minePendingTransactions(antMinerAddress);

// Check the balance of each user
console.log(
  "Balance of antMiner:",
  blockchain.getBalanceOfAddress(antMinerAddress)
);
console.log("Balance of user2:", blockchain.getBalanceOfAddress(user2Address));
console.log("Balance of user3:", blockchain.getBalanceOfAddress(user3Address));
