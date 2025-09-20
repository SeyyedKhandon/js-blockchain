import { BlockChain, Transaction } from "./blockchain.ts";
import { generateECDSAKey } from "./walletKeyGenerator.ts";

const blockchain = new BlockChain();
console.log("Blockchain Started: ", blockchain);

const antMinerKeys = generateECDSAKey();
const antMinerWalletAddress = antMinerKeys.publicKey;

const user2Keys = generateECDSAKey();
const user2WalletAddress = user2Keys.publicKey;

const user3Keys = generateECDSAKey();
const user3WalletAddress = user3Keys.publicKey;

// ROUND 1 ---- when there is no transaction on the blockchain, therefore no transactions will be valid and nothing should happen, only a reward goes to the miner for mining a block with empty transaction[]
console.log("\r\nMine Block 1:");
// Add a transaction to the pending transactions(mempool) of the blockchain
const tx1 = new Transaction(
  antMinerWalletAddress,
  user2WalletAddress,
  10,
  "Buy a coffee"
);
tx1.sign(antMinerKeys.keyPair); // AntMiner is sending 10 coin to user2, so antMiner should sign this transaction as it is the sender

const tx2 = new Transaction(
  user2WalletAddress,
  user3WalletAddress,
  3,
  "Give away"
);
tx2.sign(user2Keys.keyPair); // User2 is sending 3 coin to user3, so user2 should sign this transaction as it is the sender

// Add tx1, tx2 to pending transactions (mempool)
blockchain.addTransaction(tx1);
blockchain.addTransaction(tx2);

// Start the mining process inside the antMiner to min the block with the pending transactions
blockchain.minePendingTransactions(antMinerWalletAddress);

// Check the balance of each user
console.log(
  "Balance of antMiner:",
  blockchain.getBalanceOfAddress(antMinerWalletAddress)
); // 100
console.log(
  "Balance of user2:",
  blockchain.getBalanceOfAddress(user2WalletAddress)
); // 0
console.log(
  "Balance of user3:",
  blockchain.getBalanceOfAddress(user3WalletAddress)
); // 0

// ROUND 2 ----- Now that the first miner has some amount, it can send it to other users
console.log("\r\nMine Block 2:");
// Add a transaction to the pending transactions(mempool) of the blockchain
blockchain.addTransaction(tx1);
blockchain.addTransaction(tx2);
// Start the mining process inside the antMiner to min the block with the pending transactions
blockchain.minePendingTransactions(antMinerWalletAddress);

// Check the balance of each user
console.log(
  "Balance of antMiner:",
  blockchain.getBalanceOfAddress(antMinerWalletAddress)
); // 190
console.log(
  "Balance of user2:",
  blockchain.getBalanceOfAddress(user2WalletAddress)
); // 10
console.log(
  "Balance of user3:",
  blockchain.getBalanceOfAddress(user3WalletAddress)
); // 0 -- this is still zero, because in the second block, user2 still has a balance of zero, and just right after mining this block it would have amount 10, which means can be spend in the next block!

console.log("\r\nEntire Blockchain:", blockchain.toString());
console.log("\r\nIs chain valid?", blockchain.isChainValid()); // true

// tamper the blockchain and check the validity of the chain
blockchain.chain[1].transactions[0].amount = 1;
console.log("\r\nIs chain valid?", blockchain.isChainValid()); // false
