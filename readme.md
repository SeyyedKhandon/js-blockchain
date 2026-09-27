# js-blockchain

A simple proof-of-work blockchain and cryptocurrency, written in TypeScript, built to understand how blockchains work under the hood.

## Features

- **Blocks** with proof-of-work mining (adjustable difficulty via leading-zero hash prefix)
- **Transactions** signed and verified with ECDSA (secp256k1, via `elliptic`)
- **Wallets** — generate public/private key pairs and sign transactions
- **Mempool** — pending transactions queued before being mined into a block
- **Mining rewards** — miners are paid a coinbase-style reward for each mined block
- **Balance tracking** — compute an address's balance by walking the chain
- **Chain validation** — detect tampering by re-checking hashes, links, and transaction signatures
- **mempool.space integration** — fetch a real Bitcoin block and its transactions from the public mempool.space API

## Project structure

```
src/
  blockchain.ts                    Transaction, Block, and BlockChain classes (core implementation)
  walletKeyGenerator.ts            ECDSA key pair / wallet generation
  index.ts                         Demo: create wallets, sign transactions, mine blocks, check balances
  mempool.ts                       Fetches a real Bitcoin block from mempool.space and saves it locally
  test.ts                          Mines the fetched Bitcoin block's transactions with this project's PoW
  super-simple-mining-example.ts   Minimal standalone Block/BlockChain example, kept for reference
  utils.ts                         Small shared helpers
bitcoin-block.json                 Sample Bitcoin block data fetched via mempool.ts
```

## Getting started

Requires Node.js 23.6+ (native TypeScript support — no build step needed).

```bash
npm install
npm start
```

`npm start` runs `src/index.ts`, which:

1. Generates wallets for a miner and two users
2. Creates and signs transactions between them
3. Mines pending transactions into blocks, paying the miner a reward
4. Prints balances after each round
5. Prints the full chain and validates it (then tampers with it to show validation catching it)

### Other scripts

Run any file directly with Node's built-in TypeScript support:

```bash
node src/mempool.ts    # fetch a real Bitcoin block from mempool.space
node src/test.ts       # mine that block's transactions with this project's PoW
node src/super-simple-mining-example.ts   # minimal Block/BlockChain demo
```

## Core concepts

### Transaction

- `sender` / `receiver` — wallet addresses (public keys); `sender` is `null` for reward/coinbase transactions
- `amount`, `message`
- `sign(keyPair)` — signs the transaction hash with the sender's private key
- `isValid()` — verifies the signature against the sender's public key

### Block

- `transactions`, `previousHash`, `hash`, `timestamp`, `nonce`
- `mineBlock(difficulty)` — repeatedly increments `nonce` until the hash starts with `difficulty` leading zeros (proof of work)
- `hasValidTransactions()` — checks every transaction in the block is validly signed

### BlockChain

- `chain` — array of blocks, starting from a genesis block
- `pendingTransactions` — the mempool of transactions waiting to be mined
- `minePendingTransactions(minerAddress)` — mines a new block from pending transactions plus a mining reward, and appends it to the chain
- `addTransaction(transaction)` — validates and queues a transaction
- `getBalanceOfAddress(address)` — sums transaction amounts across the chain
- `isChainValid()` — checks every block's hash, its link to the previous block, and its transactions' signatures
