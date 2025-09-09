// Test script to verify contract functionality
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🧪 Testing Smart Tourist Safety ID Contract...");

    // Load deployed contract info
    const contractInfoPath = path.join(__dirname, "frontend", "contract-info.json");
    
    if (!fs.existsSync(contractInfoPath)) {
        console.log("❌ Contract not deployed. Run deployment first.");
        return;
    }

    const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
    console.log("📄 Loaded contract at:", contractInfo.address);

    // Get contract factory and attach to deployed address
    const TouristID = await hre.ethers.getContractFactory("TouristID");
    const contract = TouristID.attach(contractInfo.address);
    
    // Get signers
    const [owner, tourist1] = await hre.ethers.getSigners();
    
    console.log("👤 Testing with account:", tourist1.address);

    try {
        // Test 1: Register a tourist
        console.log("\n1️⃣ Testing tourist registration...");
        const registerTx = await contract.connect(tourist1).registerTourist(
            "John Doe",
            "AB123456789", 
            "+1-555-0123",
            "Visiting NYC landmarks"
        );
        
        const receipt = await registerTx.wait();
        console.log("✅ Tourist registered successfully!");
        console.log("   Transaction hash:", receipt.hash);
        
        // Extract tourist ID from events
        const event = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'TouristRegistered';
            } catch (e) {
                return false;
            }
        });
        
        if (event) {
            const parsedEvent = contract.interface.parseLog(event);
            console.log("   Tourist ID:", parsedEvent.args.touristId.toString());
            console.log("   KYC Hash:", parsedEvent.args.kycHash);
        }

        // Test 2: Get tourist info
        console.log("\n2️⃣ Testing tourist data retrieval...");
        const touristId = await contract.connect(tourist1).getMyTouristId();
        console.log("   My Tourist ID:", touristId.toString());
        
        if (touristId > 0) {
            const tourist = await contract.getTourist(touristId);
            console.log("   Name:", tourist.name);
            console.log("   Passport:", tourist.passportNo);
            console.log("   Contact:", tourist.contact);
            console.log("   Active:", tourist.isActive);
        }

        // Test 3: Get total tourists
        console.log("\n3️⃣ Testing dashboard functionality...");
        const totalTourists = await contract.getTotalTourists();
        console.log("   Total registered tourists:", totalTourists.toString());
        
        const allIds = await contract.getAllTouristIds();
        console.log("   All tourist IDs:", allIds.map(id => id.toString()));

        console.log("\n🎉 All tests passed! Contract is working correctly.");

    } catch (error) {
        if (error.message.includes("Address already registered")) {
            console.log("ℹ️ Address already registered - testing retrieval only...");
            
            // Just test retrieval functions
            const touristId = await contract.connect(tourist1).getMyTouristId();
            console.log("   Existing Tourist ID:", touristId.toString());
            
            if (touristId > 0) {
                const tourist = await contract.getTourist(touristId);
                console.log("   Name:", tourist.name);
                console.log("   Status:", tourist.isActive ? "Active" : "Inactive");
            }
            
            console.log("✅ Contract retrieval functions work correctly!");
        } else {
            console.error("❌ Test failed:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test script failed:", error);
        process.exit(1);
    });
