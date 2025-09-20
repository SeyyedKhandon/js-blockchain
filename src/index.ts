import { BlockChain, Transaction } from "./blockchain.ts";
import { generateECDSAKey } from "./walletKeyGenerator.ts";

const blockchain = new BlockChain();
console.log("Blockchain Started: ", blockchain);

const antMinerAddress = generateECDSAKey().publicKey;
const user2Address = generateECDSAKey().publicKey;
const user3Address = generateECDSAKey().publicKey;

// ROUND 1 ---- when there is no transaction on the blockchain, therefore no transactions will be valid and nothing should happen, unless a reward goes to the miner for mining an empty block
console.log("\r\nMine Block 1:");
// Add a transaction to the pending transactions(mempool) of the blockchain
blockchain.addTransaction(
  new Transaction(antMinerAddress, user2Address, 10, "Buy a coffee")
);
blockchain.addTransaction(
  new Transaction(user2Address, user3Address, 3, "Give away")
);
// Start the mining process inside the antMiner to min the block with the pending transactions
blockchain.minePendingTransactions(antMinerAddress);
// Check the balance of each user
console.log(
  "Balance of antMiner:",
  blockchain.getBalanceOfAddress(antMinerAddress)
); // 100
console.log("Balance of user2:", blockchain.getBalanceOfAddress(user2Address)); // 0
console.log("Balance of user3:", blockchain.getBalanceOfAddress(user3Address)); // 0

// ROUND 2 ----- Now that the first miner has some amount, it can send it to other users
console.log("\r\nMine Block 2:");
// Add a transaction to the pending transactions(mempool) of the blockchain
blockchain.addTransaction(
  new Transaction(antMinerAddress, user2Address, 10, "Buy a coffee")
);
blockchain.addTransaction(
  new Transaction(user2Address, user3Address, 3, "Give away")
);
// Start the mining process inside the antMiner to min the block with the pending transactions
blockchain.minePendingTransactions(antMinerAddress);

// Check the balance of each user
console.log(
  "Balance of antMiner:",
  blockchain.getBalanceOfAddress(antMinerAddress)
); // 190
console.log("Balance of user2:", blockchain.getBalanceOfAddress(user2Address)); // 10
console.log("Balance of user3:", blockchain.getBalanceOfAddress(user3Address)); // 0 -- this is still zero, because in the second block, user2 still has a balance of zero, and just right after mining this block it would have amount 10, which means can be spend in the next block!

console.log("\r\nEntire Blockchain:", blockchain.toString());
