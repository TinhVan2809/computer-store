const http = require('http');
const post = 3000;

const server = http.createServer((req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
});

server.listen(3000, () => {
    console.log(`Server is running at http://localhost:${post}/`);
})
