const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify'); // last part of a url, uniqure string to identify source
const replaceTemplate = require('./modules/replaceTemplate.js');

//////////////////  *cmd D - hightlight next of same
//FILES

/*
// Blocking, synchronous way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);
const textOut = `This is what we know about the avocardo: ${textIn}. \nCreated on ${Date.now()}`
fs.writeFileSync('./txt/output.txt', textOut);
console.log("File Written!");

// Non-blocking, asynchronous way
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    if (err) return console.log('ERROR 🧨');

    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
            console.log(data3);

            fs.writeFile(`./txt/final.txt`, `${data2}\n${data3}`, 'utf-8', err => {
                console.log('Your file has been written 👩‍💻');
            } )
        });
    });
});
console.log("Will read file!!"); 
*/

///////////////////////////
// SERVER

/// Top level code - only executed once when code starts

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

//Create Server
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true); // the true makes the query value an object

  //Setting up Rounting //
  //Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);

    res.end(output);
    //Product Page
  } else if (pathname === '/product') {
    console.log(query);
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);
    //API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
    // Not Found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>'); //resonse content
  }
});

//Start Server
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
