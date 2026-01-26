// Test locations API endpoint
import http from 'http';

console.log('🧪 Testing Locations API...\n');

const testLocations = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/locations', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Headers:', res.headers['content-type']);
        console.log('\nResponse Body:');
        
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Success!');
            console.log(`Found ${json.length} locations:`);
            json.forEach((loc, idx) => {
              console.log(`  ${idx + 1}. ${loc.name} (${loc.city}) - ID: ${loc.id}`);
            });
          } else {
            console.log('❌ Error Response:');
            console.log(JSON.stringify(json, null, 2));
          }
        } catch (e) {
          console.log('Raw response:', data);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      console.log('💡 Make sure the server is running: npm run dev:server');
      resolve();
    });
  });
};

testLocations().then(() => process.exit(0));
