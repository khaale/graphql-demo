'use strict'
const http = require('http');
const url = require('url');

// Customers list
const orders = [
    { orderId: 101, customerId:1 },
    { orderId: 102, customerId:1 },
    { orderId: 201, customerId:2 },
    { orderId: 202, customerId:2 },
];

// Read parameters
const args = process.argv.slice(2);
const port = args.length > 0 ? args[0] : 8080

// Run server
console.log('Listening on port ' + port);
http.createServer((req, res) => {
    console.log('Received request, url: ' + req.url);
    const query = url.parse(req.url, true).query;
    console.log(query); 

    const customerIdQuery = query['customerId[]'];
    const customerIds = query['customerId[]']
        ? Array.from(query['customerId[]']) 
        : (query['customerId'] 
            ? [query['customerId']] 
            : []);
    console.log(customerIds);

    const result = customerIds.map(cId => orders.filter(o => o.customerId == cId));
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(result)); 
    res.end(); 
}).listen(port);