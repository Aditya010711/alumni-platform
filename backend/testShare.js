const http = require('http');

async function testShare() {
  const reqPost = (path, body, token) => new Promise((resolve) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(r) }));
    });
    req.write(data);
    req.end();
  });
  
  const reqGet = (path, token) => new Promise((resolve) => {
    const options = { hostname: 'localhost', port: 5000, path: path, method: 'GET', headers: { 'Authorization': 'Bearer ' + token } };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(r) }));
    });
    req.end();
  });

  const email = 'test' + Date.now() + '@test.com';
  let res = await reqPost('/api/auth/register', { username: 'testuser', email, password: 'password123' });
  const token = res.data.token;
  
  await reqPost('/api/profiles', { firstName: 'Test', lastName: 'User', graduationYear: 2020 }, token);
  
  res = await reqPost('/api/posts', { content: 'My first post' }, token);
  const postId = res.data._id;
  
  res = await reqPost('/api/posts/' + postId + '/share', {}, token);
  console.log('SHARE STATUS:', res.status);
  console.log('SHARE DATA:', res.data);
}
testShare().catch(console.error);
