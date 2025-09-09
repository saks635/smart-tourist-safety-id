#!/usr/bin/env node

/**
 * Smart Tourist Safety ID - Quick Start Script
 * This script helps you get the demo running quickly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Smart Tourist Safety ID - Quick Start');
console.log('=========================================\n');

function runCommand(command, description) {
    console.log(`📝 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed\n`);
    } catch (error) {
        console.error(`❌ Error: ${description} failed`);
        console.error(error.message);
        process.exit(1);
    }
}

function checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    try {
        execSync('node --version', { stdio: 'pipe' });
        console.log('✅ Node.js is installed');
    } catch (error) {
        console.error('❌ Node.js is not installed. Please install Node.js first.');
        process.exit(1);
    }

    try {
        execSync('npm --version', { stdio: 'pipe' });
        console.log('✅ npm is installed');
    } catch (error) {
        console.error('❌ npm is not installed. Please install npm first.');
        process.exit(1);
    }

    console.log('✅ Prerequisites check passed\n');
}

function installDependencies() {
    if (!fs.existsSync('node_modules')) {
        runCommand('npm install', 'Installing dependencies');
    } else {
        console.log('📦 Dependencies already installed\n');
    }
}

function compileContracts() {
    runCommand('npx hardhat compile', 'Compiling smart contracts');
}

function startLocalBlockchain() {
    console.log('🔗 Starting local blockchain...');
    console.log('   This will start a local Hardhat network on http://localhost:8545');
    console.log('   Keep this terminal open and run deployment in a new terminal\n');
    
    console.log('Commands to run in separate terminals:');
    console.log('1. Deploy contracts: npx hardhat run scripts/deploy.js --network localhost');
    console.log('2. Open frontend: Open frontend/index.html in your browser');
    console.log('3. Connect MetaMask to: http://localhost:8545 (Chain ID: 1337)\n');
    
    try {
        execSync('npx hardhat node', { stdio: 'inherit' });
    } catch (error) {
        // User likely stopped the blockchain
        console.log('\n🛑 Local blockchain stopped');
    }
}

function deployContracts() {
    runCommand('npx hardhat run scripts/deploy.js --network localhost', 'Deploying contracts to local network');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage: node scripts/quick-start.js [command]');
        console.log('');
        console.log('Commands:');
        console.log('  setup    - Install dependencies and compile contracts');
        console.log('  node     - Start local blockchain');
        console.log('  deploy   - Deploy contracts to local network');
        console.log('  all      - Run complete setup (default)');
        console.log('');
        return;
    }

    const command = args[0] || 'all';

    switch (command) {
        case 'setup':
            checkPrerequisites();
            installDependencies();
            compileContracts();
            console.log('🎉 Setup complete! Run "node scripts/quick-start.js node" to start the blockchain.');
            break;
            
        case 'node':
            startLocalBlockchain();
            break;
            
        case 'deploy':
            deployContracts();
            console.log('🎉 Deployment complete! Open frontend/index.html in your browser.');
            break;
            
        case 'all':
        default:
            checkPrerequisites();
            installDependencies();
            compileContracts();
            console.log('🎉 Setup complete!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Start blockchain: node scripts/quick-start.js node');
            console.log('2. In new terminal, deploy: node scripts/quick-start.js deploy');
            console.log('3. Open frontend/index.html in browser');
            console.log('4. Connect MetaMask to localhost:8545 (Chain ID: 1337)');
            break;
    }
}

main();
