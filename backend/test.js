const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/posts',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
     console.log(JSON.parse(data).message || 'No feed data');
  });
});

req.on('error', (e) => {
  console.error(e.message);
});
req.end();
