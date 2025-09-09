// Smart Tourist Safety ID Demo - Main Application

class TouristApp {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.userAccount = null;
        this.contractAddress = null;
        this.contractABI = null;
        this.currentLocation = { lat: 0, lng: 0, zone: 'unknown' };
        this.mockTourists = new Map(); // For demo purposes
        
        // Predefined geo-fence zones (mock coordinates)
        this.geoFences = {
            safe: {
                name: 'Safe Tourist Zone',
                coords: { lat: 40.7128, lng: -74.0060 }, // NYC
                color: 'success'
            },
            danger: {
                name: 'High Risk Area',
                coords: { lat: 40.7589, lng: -73.9851 }, // Times Square (mock danger)
                color: 'danger'
            },
            tourist: {
                name: 'Popular Tourist Attraction',
                coords: { lat: 40.7505, lng: -73.9934 }, // Central Park
                color: 'info'
            }
        };

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Tourist App...');
        await this.loadContractInfo();
        this.setupEventListeners();
        this.updateUI();
        await this.checkWalletConnection();
    }

    async loadContractInfo() {
        try {
            // Load contract info
            const contractInfoResponse = await fetch('./contract-info.json');
            if (contractInfoResponse.ok) {
                const contractInfo = await contractInfoResponse.json();
                this.contractAddress = contractInfo.address;
                console.log('📄 Contract address loaded:', this.contractAddress);
            }

            // Load contract ABI
            const abiResponse = await fetch('./TouristID-abi.json');
            if (abiResponse.ok) {
                this.contractABI = await abiResponse.json();
                console.log('📋 Contract ABI loaded');
            }
        } catch (error) {
            console.warn('⚠️ Contract files not found. Deploy contract first.');
            this.showAlert('warning', 'Contract not deployed. Please deploy the smart contract first.');
        }
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        
        // Registration form
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerTourist();
        });

        // Check for MetaMask account changes
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts) => {
                this.handleAccountChange(accounts);
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet(false);
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        } else {
            this.showConnectionWarning();
        }
    }

    async connectWallet(requestPermission = true) {
        if (typeof window.ethereum !== 'undefined') {
            try {
                if (requestPermission) {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                }

                this.web3 = new Web3(window.ethereum);
                const accounts = await this.web3.eth.getAccounts();
                
                if (accounts.length > 0) {
                    this.userAccount = accounts[0];
                    this.updateWalletUI();
                    await this.initContract();
                    await this.loadUserTourist();
                    document.getElementById('connectionStatus').style.display = 'none';
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
                this.showAlert('danger', 'Failed to connect wallet. Please try again.');
            }
        } else {
            this.showAlert('warning', 'MetaMask not detected. Please install MetaMask to use this app.');
        }
    }

    async initContract() {
        if (this.web3 && this.contractAddress && this.contractABI) {
            this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
            console.log('📝 Contract initialized');
        }
    }

    async handleAccountChange(accounts) {
        if (accounts.length === 0) {
            this.userAccount = null;
            this.contract = null;
            this.updateWalletUI();
            this.showConnectionWarning();
        } else {
            this.userAccount = accounts[0];
            this.updateWalletUI();
            await this.initContract();
            await this.loadUserTourist();
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletStatus = document.getElementById('walletStatus');

        if (this.userAccount) {
            connectBtn.innerHTML = '<i class=\"fas fa-check-circle\"></i> Connected';
            connectBtn.className = 'btn btn-success me-2';
            walletStatus.textContent = `${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}`;
        } else {
            connectBtn.innerHTML = '<i class=\"fas fa-wallet\"></i> Connect Wallet';
            connectBtn.className = 'btn btn-outline-light me-2';
            walletStatus.textContent = '';
        }
    }

    showConnectionWarning() {
        document.getElementById('connectionStatus').style.display = 'block';
    }

    async registerTourist() {
        if (!this.contract || !this.userAccount) {
            this.showAlert('warning', 'Please connect your wallet first.');
            return;
        }

        const name = document.getElementById('touristName').value;
        const passportNo = document.getElementById('passportNo').value;
        const contact = document.getElementById('contact').value;
        const itinerary = document.getElementById('itinerary').value || 'Standard tourism package';

        const registerBtn = document.getElementById('registerBtn');
        const spinner = registerBtn.querySelector('.spinner-border');
        
        try {
            // Show loading state
            registerBtn.disabled = true;
            spinner.classList.remove('d-none');

            console.log('📝 Registering tourist:', name);

            // Call smart contract
            const tx = await this.contract.methods.registerTourist(name, passportNo, contact, itinerary)
                .send({ from: this.userAccount });

            console.log('✅ Registration successful:', tx.transactionHash);

            // Get the tourist ID from the transaction
            const receipt = await this.web3.eth.getTransactionReceipt(tx.transactionHash);
            const touristId = parseInt(receipt.logs[0].topics[1], 16);

            this.showAlert('success', `Tourist ID ${touristId} registered successfully!`);
            
            // Clear form
            document.getElementById('registrationForm').reset();
            
            // Load updated tourist info
            await this.loadUserTourist();
            await this.loadDashboard();

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. ';
            
            if (error.message.includes('Address already registered')) {
                errorMessage = 'This wallet address is already registered.';
            } else if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was cancelled by user.';
            }
            
            this.showAlert('danger', errorMessage);
        } finally {
            registerBtn.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    async loadUserTourist() {
        if (!this.contract || !this.userAccount) return;

        try {
            const touristId = await this.contract.methods.getMyTouristId().call({ from: this.userAccount });
            
            if (touristId > 0) {
                const tourist = await this.contract.methods.getTourist(touristId).call();
                this.displayTouristCard(tourist);
            }
        } catch (error) {
            console.log('No tourist registered for this account');
        }
    }

    displayTouristCard(tourist) {
        const cardElement = document.getElementById('touristIdCard');
        
        cardElement.innerHTML = `
            <div class=\"tourist-id-card\">
                <div class=\"mb-3\">
                    <i class=\"fas fa-id-badge fa-3x mb-2\"></i>
                    <div class=\"tourist-id-number\">ID: ${tourist.id}</div>
                </div>
                <div class=\"mb-2\">
                    <strong>${tourist.name}</strong>
                </div>
                <div class=\"mb-2\">
                    <small>Passport: ${tourist.passportNo}</small>
                </div>
                <div class=\"mb-2\">
                    <small>Contact: ${tourist.contact}</small>
                </div>
                <div class=\"mb-2\">
                    <small>Status: ${tourist.isActive ? 'Active' : 'Inactive'}</small>
                </div>
                <hr class=\"my-3\" style=\"opacity: 0.5;\">
                <div class=\"kyc-hash\">
                    <small>KYC Hash:</small><br>
                    ${tourist.kycHash}
                </div>
            </div>
        `;
    }

    showAlert(type, message) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            <i class=\"fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}\"></i>
            ${message}
            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, 5000);
    }

    updateUI() {
        this.updateLocationDisplay();
        this.updateStatistics();
    }

    updateLocationDisplay() {
        const locationText = document.getElementById('locationText');
        const locationStatus = document.getElementById('locationStatus');
        
        if (this.currentLocation.zone === 'unknown') {
            locationText.textContent = 'Location not detected';
            locationStatus.className = 'alert alert-info';
            locationStatus.innerHTML = '<i class=\"fas fa-info-circle\"></i> Click buttons above to simulate location movement';
        }
    }

    updateStatistics() {
        // Mock statistics for demo
        const stats = this.calculateMockStatistics();
        
        document.getElementById('totalTourists').textContent = stats.total;
        document.getElementById('safeTourists').textContent = stats.safe;
        document.getElementById('dangerTourists').textContent = stats.danger;
        document.getElementById('activeTourists').textContent = stats.active;
    }

    calculateMockStatistics() {
        let total = this.mockTourists.size;
        let safe = 0, danger = 0, active = 0;
        
        // Add blockchain data if available
        if (this.contract && this.userAccount) {
            // This would be implemented with real contract calls
            total += 1; // Current user if registered
            active += 1;
        }
        
        this.mockTourists.forEach(tourist => {
            if (tourist.location === 'safe') safe++;
            if (tourist.location === 'danger') danger++;
            if (tourist.active) active++;
        });
        
        return { total, safe, danger, active };
    }
}

// Global functions for UI interaction
window.simulateLocation = function(zoneType) {
    const app = window.touristApp;
    const zone = app.geoFences[zoneType];
    
    if (!zone) return;
    
    app.currentLocation = {
        lat: zone.coords.lat,
        lng: zone.coords.lng,
        zone: zoneType
    };
    
    // Update location display
    const locationText = document.getElementById('locationText');
    const locationStatus = document.getElementById('locationStatus');
    const currentLocation = document.getElementById('currentLocation');
    
    locationText.textContent = zone.name;
    currentLocation.className = `p-2 rounded location-${zoneType}`;
    
    // Update status message
    locationStatus.className = `alert alert-${zone.color}`;
    
    switch(zoneType) {
        case 'safe':
            locationStatus.innerHTML = '<i class=\"fas fa-check-circle\"></i> You are in a safe zone. Enjoy your visit!';
            break;
        case 'danger':
            locationStatus.innerHTML = '<i class=\"fas fa-exclamation-triangle\"></i> Warning: You have entered a high-risk area!';
            triggerGeofenceAlert('High Risk Zone Detected!', 'You have entered a restricted or dangerous area. Please take necessary precautions and consider moving to a safer location.');
            break;
        case 'tourist':
            locationStatus.innerHTML = '<i class=\"fas fa-camera\"></i> You are at a popular tourist attraction. Have fun!';
            break;
    }
    
    app.updateStatistics();
};

window.loadDashboard = async function() {
    const app = window.touristApp;
    const dashboardContent = document.getElementById('dashboardContent');
    
    dashboardContent.innerHTML = '<div class=\"text-center\"><div class=\"spinner-border\" role=\"status\"></div><p class=\"mt-2\">Loading tourists...</p></div>';
    
    try {
        let tourists = [];
        
        // Load from blockchain if available
        if (app.contract) {
            try {
                const totalTourists = await app.contract.methods.getTotalTourists().call();
                const allIds = await app.contract.methods.getAllTouristIds().call();
                
                for (let i = 0; i < Math.min(allIds.length, 10); i++) { // Limit to 10 for demo
                    const tourist = await app.contract.methods.getTourist(allIds[i]).call();
                    tourists.push({
                        id: tourist.id,
                        name: tourist.name,
                        isActive: tourist.isActive,
                        location: Math.random() > 0.7 ? 'danger' : 'safe' // Mock location status
                    });
                }
            } catch (error) {
                console.log('Could not load blockchain tourists:', error.message);
            }
        }
        
        // Add mock tourists for demo
        const mockTourists = [
            { id: 'M1', name: 'Alice Johnson', isActive: true, location: 'safe' },
            { id: 'M2', name: 'Bob Smith', isActive: true, location: 'danger' },
            { id: 'M3', name: 'Carol Davis', isActive: true, location: 'safe' },
        ];
        
        tourists = tourists.concat(mockTourists);
        
        if (tourists.length === 0) {
            dashboardContent.innerHTML = `
                <div class=\"text-center text-muted py-3\">
                    <i class=\"fas fa-users fa-2x mb-2\"></i>
                    <p>No registered tourists found</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        tourists.forEach(tourist => {
            const statusIcon = tourist.location === 'danger' ? 'exclamation-triangle' : 'check-circle';
            const statusColor = tourist.location === 'danger' ? 'danger' : 'success';
            
            html += `
                <div class=\"tourist-item ${tourist.location}\">
                    <div class=\"d-flex justify-content-between align-items-center\">
                        <div>
                            <strong>ID: ${tourist.id}</strong><br>
                            <span class=\"text-muted\">${tourist.name}</span>
                        </div>
                        <div class=\"text-end\">
                            <span class=\"badge bg-${statusColor}\">
                                <i class=\"fas fa-${statusIcon}\"></i>
                                ${tourist.location === 'danger' ? 'Alert' : 'Safe'}
                            </span><br>
                            <small class=\"text-muted\">${tourist.isActive ? 'Active' : 'Inactive'}</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        dashboardContent.innerHTML = html;
        app.updateStatistics();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        dashboardContent.innerHTML = `
            <div class=\"alert alert-danger\">
                <i class=\"fas fa-exclamation-triangle\"></i>
                Error loading dashboard data
            </div>
        `;
    }
};

function triggerGeofenceAlert(title, message) {
    // Update modal content
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('alertModal'));
    modal.show();
    
    // Add sound effect (optional)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFAlGn+DyvmwhBSuBzvLZibwHGWi49+WgUggfYKzHwGomBSl+zPHbiEAGZmSgKyaR2E5rZIEJe30wZZg5lZ2Dk4pYfjGBaLv69p5OEAj3p+T0QAoHGV+35uaiThoHGF+35uaiThoHGGKR2/LCeiQFoUXrN/2ScgY');\n        audio.play().catch(() => {}); // Ignore if audio fails\n    } catch (e) {\n        // Ignore audio errors\n    }\n}\n\n// Initialize app when DOM is loaded\ndocument.addEventListener('DOMContentLoaded', () => {\n    window.touristApp = new TouristApp();\n});"},{"line_range_start":1,"line_range_end":389}}
</function_results>

<function_calls>
<invoke name="mark_todo_as_done">
<parameter name="todo_ids">["6bb84d2c-557d-4d55-8e59-7da276554771"]
