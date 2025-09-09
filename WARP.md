# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Smart Tourist Safety ID is a blockchain-based tourist identification system that combines Ethereum smart contracts with a web interface to provide secure tourist registration and mock geo-fencing safety alerts. This is an MVP/demo project showcasing core blockchain functionality.

## Development Commands

### Setup and Dependencies
```bash
# Install all dependencies
npm install

# Quick setup script (installs deps and compiles)
node scripts/quick-start.js setup
```

### Smart Contract Development
```bash
# Compile contracts
npm run compile
# or
npx hardhat compile

# Start local blockchain (keep running in separate terminal)
npm run node
# or
npx hardhat node

# Deploy to local network
npm run deploy
# or
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet (Sepolia)
npm run deploy:testnet
```

### Testing
```bash
# Run tests (currently no tests implemented)
npm test
# or
npx hardhat test
```

### Quick Development Workflow
```bash
# Terminal 1: Start local blockchain
node scripts/quick-start.js node

# Terminal 2: Deploy contracts
node scripts/quick-start.js deploy

# Open frontend/index.html in browser
# Configure MetaMask: localhost:8545, Chain ID: 1337
```

## Architecture Overview

### Smart Contract Layer (`contracts/TouristID.sol`)
- **Core Contract**: `TouristID` - Handles tourist registration and KYC hash storage
- **Key Functions**:
  - `registerTourist()` - Creates unique tourist ID with KYC hash
  - `getTourist()` - Retrieves tourist data by ID
  - `getAllTouristIds()` - Returns all registered tourist IDs for dashboard
  - `verifyKYC()` - Validates tourist information against stored hash
- **Storage**: Uses mappings for efficient ID-to-tourist and address-to-ID lookups
- **Events**: Emits `TouristRegistered` and `TouristUpdated` for frontend integration

### Frontend Architecture (`frontend/`)
- **Main App**: `app.js` contains `TouristApp` class managing all functionality
- **Web3 Integration**: Direct MetaMask connection, no external Web3 library dependencies
- **Contract Interaction**: Dynamically loads contract ABI and address from deployment artifacts
- **Mock Systems**: Geo-fencing simulation with predefined zones (NYC coordinates)
- **State Management**: Class-based architecture with local state for tourists and location data

### Deployment System (`scripts/`)
- **Automated Deployment**: `deploy.js` compiles, deploys, and saves contract info to frontend
- **Quick Start Script**: `quick-start.js` provides guided setup with prerequisite checking
- **Artifact Management**: Automatically copies ABI to frontend and saves deployment info

### Key Data Flows
1. **Registration**: Frontend → MetaMask → Smart Contract → Event Emission → UI Update
2. **Verification**: Contract generates KYC hash from user data + timestamp + address
3. **Dashboard**: Loads all tourist IDs from contract, displays with mock location data
4. **Geo-fencing**: Pure frontend simulation using predefined coordinate zones

## Network Configuration

### Local Development
- **Network**: Hardhat local node
- **URL**: `http://127.0.0.1:8545`
- **Chain ID**: `1337`
- **Accounts**: Hardhat provides 20 test accounts with 10,000 ETH each

### Testnet Deployment
- **Network**: Sepolia testnet
- **Configuration**: Set `SEPOLIA_URL` and `PRIVATE_KEY` environment variables
- **Verification**: Contract can be verified on Etherscan post-deployment

## File Structure Context

### Generated Files (Not in Git)
- `artifacts/` - Hardhat compilation output
- `cache/` - Hardhat cache files
- `frontend/contract-info.json` - Deployment address and metadata
- `frontend/TouristID-abi.json` - Contract ABI for frontend

### Environment Requirements
- Node.js v16+
- MetaMask browser extension
- Modern browser with ES6 support

## Development Notes

### Smart Contract Patterns
- Uses OpenZeppelin contracts as dependencies
- Implements access control (tourists can only deactivate their own IDs)
- KYC hash includes timestamp and sender address for uniqueness
- Events are crucial for frontend state synchronization

### Frontend Integration
- Contract address and ABI are loaded dynamically from deployment artifacts
- Web3 connection handled entirely through MetaMask injection
- Error handling includes user-friendly messages for common blockchain errors
- Mock data system allows demo functionality without real GPS/IoT integration

### Demo/MVP Limitations
- No real GPS integration (uses mock coordinate simulation)
- No backend server (pure client-side + blockchain)
- KYC verification is simplified for demo purposes
- No formal test suite implemented yet

### Production Considerations
This is a proof-of-concept. For production deployment, consider:
- Real GPS/IoT integration for geo-fencing
- Government API integration for passport verification
- Mobile app development
- Formal security auditing of smart contracts
- Comprehensive test suite implementation
