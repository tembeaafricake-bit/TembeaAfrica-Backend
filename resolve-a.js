const dns = require('dns');

dns.lookup('google.com', (err, address, family) => {
  console.log('google.com lookup:', err || address);
});

dns.lookup('tembeaafrica-shard-00-00.mikpbrf.mongodb.net', (err, address, family) => {
  console.log('MongoDB Shard lookup:', err || address);
});
