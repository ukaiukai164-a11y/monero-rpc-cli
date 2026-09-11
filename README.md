# Monero RPC CLI

A small TypeScript CLI for exploring and learning about the Monero network through `monero-ts`.

Built for network exploration, RPC learning, and educational use.

The CLI can inspect network information, blocks, transactions, ring members, outputs, and the mempool using a Monero daemon RPC endpoint.

## Requirements

- Node.js
- npm
- Access to a Monero daemon RPC endpoint

By default, the CLI connects to:

```text
http://127.0.0.1:18081
```

## Installation

```bash
# Clone the repository
git clone https://github.com/ukaiukai164-a11y/monero-rpc-cli.git

# Move into the project directory
cd monero-rpc-cli

# Install dependencies
npm install
```

## Usage

Run the CLI with:

```bash
npx tsx src/monero-cli.ts <command>
```

## Commands

Show Monero network information:

```bash
npx tsx src/monero-cli.ts info
```

Show a block by height:

```bash
npx tsx src/monero-cli.ts block 3000000
```

Show a transaction by hash:

```bash
npx tsx src/monero-cli.ts tx <transaction-hash>
```

Show mempool information:

```bash
npx tsx src/monero-cli.ts mempool
```

## Custom daemon

You can specify another Monero daemon using the MONERO_DAEMON_URI environment variable.

Example:

```bash
MONERO_DAEMON_URI=http://192.168.1.100:18081 npx tsx src/monero-cli.ts info
```

If MONERO_DAEMON_URI is not set, the CLI uses:

http://127.0.0.1:18081

