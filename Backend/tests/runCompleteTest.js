#!/usr/bin/env node

// Complete Test Suite Runner
console.log('🧪 SHLOKAYUG COMPLETE TEST SUITE');
console.log('='.repeat(50));

const { execSync, spawn } = require('child_process');
const path = require('path');

// Configuration
const config = {
  serverPort: 5001, // Use different port for testing to avoid conflicts
  serverStartDelay: 8000, // 8 seconds for server to fully start
  testTimeout: 30000 // 30 seconds timeout for tests
};

let serverProcess = null;

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runCommand = (command, options = {}) => {
  try {
    console.log(`🔧 Running: ${command}`);
    const result = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

// Start the server
const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server...');
    
    // Set a unique port for testing to avoid conflicts
    const testPort = process.env.TEST_PORT || 5001;
    const env = { ...process.env, PORT: testPort };
    
    serverProcess = spawn('node', ['src/app.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: env
    });

    let startupOutput = '';
    
    serverProcess.stdout.on('data', (data) => {
      startupOutput += data.toString();
      if (startupOutput.includes('Sanskrit Learning Platform Backend Ready!')) {
        console.log('✅ Server started successfully');
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      // Ignore warnings, only fail on actual errors
      if (errorMsg.includes('Error:') && !errorMsg.includes('Warning:')) {
        console.error('❌ Server startup error:', errorMsg);
        reject(new Error('Server failed to start'));
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (!startupOutput.includes('Sanskrit Learning Platform Backend Ready!')) {
        console.log('⏰ Server startup timeout, proceeding anyway...');
        resolve();
      }
    }, config.serverStartDelay);

    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      reject(error);
    });
  });
};

// Stop the server
const stopServer = () => {
  if (serverProcess) {
    console.log('🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
};

// Check server health
const checkServerHealth = async () => {
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: config.serverPort,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server health check passed');
        resolve(true);
      } else {
        reject(new Error(`Server health check failed: ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(new Error(`Server not responding: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Server health check timeout'));
    });

    req.end();
  });
};

// Main test execution
const runTests = async () => {
  try {
    console.log('📋 Step 1: Database Setup');
    console.log('-'.repeat(30));
    
    // Seed the database
    console.log('🌱 Seeding database with test data...');
    runCommand('node tests/seedDatabase.js');
    console.log('✅ Database seeded successfully\n');
    
    console.log('📋 Step 2: Server Startup');
    console.log('-'.repeat(30));
    
    // Start the server
    await startServer();
    await sleep(2000); // Extra delay to ensure full startup
    
    // Verify server is responsive
    await checkServerHealth();
    console.log('');
    
    console.log('📋 Step 3: Integration Tests');
    console.log('-'.repeat(30));
    
    // Run the comprehensive integration test
    console.log('🧪 Running comprehensive integration tests...');
    runCommand('node tests/integration/comprehensive-integration-test.js');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('✅ Database seeded with proper test data');
    console.log('✅ Server started and health checked'); 
    console.log('✅ Payment-enrollment integration verified');
    console.log('✅ All endpoints functioning correctly');
    console.log('\n🚀 Ready for production deployment or Phase 4 development!');
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ TEST SUITE FAILED');
    console.log('='.repeat(50));
    console.error('Error:', error.message);
    
    // Show troubleshooting steps
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure MongoDB is running');
    console.log('2. Check .env file configuration');
    console.log('3. Verify no other process is using port 5000');
    console.log('4. Check server logs for detailed errors');
    
    process.exit(1);
  } finally {
    stopServer();
  }
};

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted');
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test suite terminated');
  stopServer();
  process.exit(0);
});

// Run the tests
if (require.main === module) {
  runTests().catch((error) => {
    console.error('❌ Test suite failed:', error.message);
    stopServer();
    process.exit(1);
  });
}

module.exports = { runTests };