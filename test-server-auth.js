// Test server authentication endpoint
import http from 'http';

const testAuth = async () => {
  console.log('🧪 Testing Server Authentication Endpoint...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing /api/health endpoint...');
  await new Promise((resolve) => {
    http.get('http://localhost:3001/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('   Status:', res.statusCode);
          console.log('   Response:', JSON.stringify(json, null, 2));
          if (json.configured === 'yes') {
            console.log('   ✅ Server is properly configured');
          } else {
            console.log('   ⚠️  Server database not configured');
          }
          resolve();
        } catch (e) {
          console.log('   ❌ Failed to parse response:', data);
          resolve();
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Server not running:', err.message);
      console.log('   💡 Start server with: npm run dev:server');
      resolve();
    });
  });
  
  // Test 2: Routes endpoint
  console.log('\n2️⃣ Testing /api/routes endpoint...');
  await new Promise((resolve) => {
    http.get('http://localhost:3001/api/routes', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('   Status:', res.statusCode);
          console.log('   Available routes:', Object.keys(json.routes || {}));
          resolve();
        } catch (e) {
          console.log('   ❌ Failed to parse response');
          resolve();
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Server not running');
      resolve();
    });
  });
  
  // Test 3: Login endpoint (should fail without token, but check if it's reachable)
  console.log('\n3️⃣ Testing /api/auth/login endpoint (without token)...');
  await new Promise((resolve) => {
    const postData = JSON.stringify({});
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('   Status:', res.statusCode);
          console.log('   Error code:', json.code);
          console.log('   Message:', json.message);
          
          if (json.code === 'SERVICE_NOT_CONFIGURED') {
            console.log('   ❌ Server configuration error detected!');
            console.log('   💡 Check Firebase Admin SDK initialization');
          } else if (json.code === 'ID_TOKEN_REQUIRED') {
            console.log('   ✅ Endpoint is working (correctly requires token)');
          } else {
            console.log('   ⚠️  Unexpected response');
          }
          resolve();
        } catch (e) {
          console.log('   Response:', data);
          resolve();
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('   ❌ Server not running:', err.message);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
  
  console.log('\n✅ Testing complete!');
  console.log('\n💡 If you see "SERVICE_NOT_CONFIGURED" error:');
  console.log('   1. Make sure serviceAccountKey.json exists in project root');
  console.log('   2. Check FIREBASE_SERVICE_ACCOUNT_PATH in .env file');
  console.log('   3. Restart the server: npm run dev:server');
};

testAuth().then(() => process.exit(0)).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
