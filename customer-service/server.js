'use strict'
const http = require('http');

// Customers list
const customers = [
    { customerId:1, name:'Alex'},
    { customerId:2, name:'Bob'}
];

// Read parameters
const args = process.argv.slice(2);
const port = args.length > 0 ? args[0] : 8080

// Run server
console.log('Listening on port ' + port);
http.createServer((req, res) => {
    console.log('Received request, url: ' + req.url);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(customers)); 
    res.end(); 
}).listen(port);