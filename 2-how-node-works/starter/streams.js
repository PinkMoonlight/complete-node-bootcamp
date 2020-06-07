const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
    // Solution 1 (for small data or locally, takes a long time load)
   /* fs.readFile('test-file.txt', (err, data) => {
        if (err) console.lof(err);
        res.end(data);
    }); */

    // Solution 2 Streams
    /* const readable = fs.createReadStream('test-file.txt');
    readable.on('data', (chunk) => {
        res.write(chunk); // writable stream
    });
    readable.on('end', () => { //handle once all the data is finished being read
        res.end();
    });
    readable.on('error', err => { //access to error object
        console.log('err');
        res.statusCode = 500;
        res.end("file not found");
        
    }) */

    // Solution 3 Pipe operator solves the problem for back pressure, data coming too fast for writing
    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(res);
    //readableSource.pipe(writeableDestination);

});

server.listen(8000, '127.0.0.1', () => {
    console.log('listening...')
})