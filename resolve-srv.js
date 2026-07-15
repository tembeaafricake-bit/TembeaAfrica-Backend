const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.tembeaafrica.mikpbrf.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV Resolution failed:', err);
    
    // Fallback: resolve TXT record to check replica set name
    dns.resolveTxt('tembeaafrica.mikpbrf.mongodb.net', (errTxt, txtRecords) => {
      if (errTxt) {
        console.error('TXT Resolution failed:', errTxt);
      } else {
        console.log('TXT Records:', txtRecords);
      }
    });
    return;
  }
  console.log('SRV Addresses:', addresses);
});
