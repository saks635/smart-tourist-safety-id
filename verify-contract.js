const hre = require("hardhat");

async function main() {
    console.log("🔍 Verifying contract functionality...");
    
    // Deploy fresh contract for testing
    const TouristID = await hre.ethers.getContractFactory("TouristID");
    const contract = await TouristID.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("📍 Test contract deployed at:", contractAddress);
    
    // Get test accounts
    const [owner, tourist] = await hre.ethers.getSigners();
    console.log("🧪 Testing with account:", tourist.address);
    
    try {
        // Test 1: Register tourist
        console.log("\n1. Testing registration...");
        const tx = await contract.connect(tourist).registerTourist(
            "John Doe",
            "AB123456",
            "+1-555-0123", 
            "Test itinerary"
        );
        await tx.wait();
        console.log("✅ Registration successful");
        
        // Test 2: Get tourist ID
        console.log("\n2. Testing getMyTouristId...");
        const myId = await contract.connect(tourist).getMyTouristId();
        console.log("✅ Tourist ID:", myId.toString());
        
        // Test 3: Get tourist data
        console.log("\n3. Testing getTourist...");
        const touristData = await contract.getTourist(myId);
        console.log("✅ Tourist data:");
        console.log("   Name:", touristData.name);
        console.log("   Active:", touristData.isActive);
        
        // Test 4: Get total count
        console.log("\n4. Testing getTotalTourists...");
        const total = await contract.getTotalTourists();
        console.log("✅ Total tourists:", total.toString());
        
        console.log("\n🎉 All contract functions working correctly!");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main().catch(console.error);
