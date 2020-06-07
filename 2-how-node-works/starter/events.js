const EventEmitter = require('events'); //built in node module
const http = require('http');

class Sales extends EventEmitter {
    constructor() {
        super();
    }
}

const myEmitter = new Sales();

// Observers that observe the event
myEmitter.on('newSale', () => {
    console.log('There was a new sale!')
});

myEmitter.on('newSale', ()=> {
    console.log('Customer name: Kate');
})

myEmitter.on('newSale', stock => {
    console.log(`There are now ${stock} items left in stock`)
})

myEmitter.emit('newSale', 9) // object that emits the event



/////////////////////////////

const server = http.createServer();

server.on('request', (req, res) => {
    console.log('Request received');
    res.end('Request recieved');    
})

server.on('request', (req, res) => {
    console.log('Another request recieved');    
})

server.on('close', () => {
    console.log("sever closed");
});

server.listen(8000, '127.0.0.1', () => {
    console.log("waiting for requests....");
    
})

