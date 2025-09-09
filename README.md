# Smart Tourist Safety ID Demo

A blockchain-based tourist identification system with geo-fencing safety alerts.

## Features

- **Blockchain Tourist ID**: Generate unique tourist IDs using Ethereum smart contracts
- **KYC Hash Storage**: Secure storage of tourist information hash on blockchain
- **Web Interface**: Simple HTML/JS interface for tourist registration
- **Mock Geo-Fencing**: Simulated location tracking with high-risk zone alerts
- **Mini Dashboard**: Display registered tourists and their safety status

## Tech Stack

- **Blockchain**: Solidity, Hardhat
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Web3**: MetaMask integration
- **Testing**: Local Ganache or Ethereum testnet

## Project Structure

```
├── contracts/          # Solidity smart contracts
├── frontend/          # Web interface files
├── scripts/           # Deployment and utility scripts
├── README.md          # Project documentation
└── package.json       # Node.js dependencies
```

## Quick Start

1. Install dependencies: `npm install`
2. Start local blockchain: `npx hardhat node`
3. Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
4. Open `frontend/index.html` in browser
5. Connect MetaMask and register tourists

## 1-Hour MVP Demo Flow

1. Register tourist → Smart contract generates unique ID
2. Display Tourist ID and KYC hash
3. Simulate location movement
4. Trigger geo-fence alerts for restricted areas
5. View all registered tourists in dashboard

## Development

This is a proof-of-concept demo focusing on core blockchain functionality with mocked safety features.
