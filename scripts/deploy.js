const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting TouristID contract deployment...");

  // Get the ContractFactory and Signers here
  const [deployer] = await hre.ethers.getSigners();

  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy TouristID contract
  const TouristID = await hre.ethers.getContractFactory("TouristID");
  const touristID = await TouristID.deploy();

  await touristID.deployed();

  console.log("✅ TouristID contract deployed to:", touristID.address);
  console.log("⛽ Gas used for deployment:", (await touristID.deployTransaction.wait()).gasUsed.toString());

  // Save the contract address and ABI to frontend
  const contractInfo = {
    address: touristID.address,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  // Create frontend directory if it doesn't exist
  const frontendDir = path.join(__dirname, "..", "frontend");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Save contract info to JSON file
  fs.writeFileSync(
    path.join(frontendDir, "contract-info.json"),
    JSON.stringify(contractInfo, null, 2)
  );

  // Copy ABI from artifacts
  const artifactsPath = path.join(__dirname, "..", "artifacts", "contracts", "TouristID.sol", "TouristID.json");
  if (fs.existsSync(artifactsPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendDir, "TouristID-abi.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("📁 Contract ABI saved to frontend/TouristID-abi.json");
  }

  console.log("📁 Contract info saved to frontend/contract-info.json");
  console.log("🎉 Deployment completed successfully!");

  // Verification info for testnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify the contract on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${touristID.address}`);
  }

  return touristID.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log(`\n✨ Contract deployed successfully at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
