// wrapper function explanation - this is inside a wrapper function  
//console.log(arguments);
//console.log(require('module').wrapper);

// module.exports
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(2, 5));


// exports
//const calc2 = require('./test-module-2'); // exports object containing properties
const { add, multiply, divide, subtract } = calc2 = require('./test-module-2');
console.log(add(2, 5));

// caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();

