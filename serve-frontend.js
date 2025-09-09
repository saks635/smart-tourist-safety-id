const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Remove query string and decode URL
    const url = decodeURIComponent(req.url.split('?')[0]);
    
    // Default to index.html for root
    let filePath = path.join(FRONTEND_DIR, url === '/' ? 'index.html' : url);
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'text/plain';
    
    console.log(`📥 Request: ${req.method} ${url}`);
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`❌ File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                console.log(`❌ Server error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            // Add CORS headers for development
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(content, 'utf-8');
            console.log(`✅ Served: ${path.basename(filePath)} (${contentType})`);
        }
    });
});

server.listen(PORT, () => {
    console.log('🌐 Smart Tourist Safety ID Frontend Server');
    console.log('==========================================');
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${FRONTEND_DIR}`);
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Open http://localhost:8000 in your browser');
    console.log('2. Make sure MetaMask is installed and connected');
    console.log('3. Add Hardhat network: http://localhost:8545, Chain ID: 1337');
    console.log('4. Import a test account from Hardhat if needed');
    console.log('');
    console.log('⚠️  Make sure the Hardhat node is running in another terminal:');
    console.log('   npx hardhat node');
    console.log('');
    console.log('🛑 Press Ctrl+C to stop the server');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n🛑 Server shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
