const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// top level code - runs at the start

//  MIDDLEWARES  - modify incoming request data (adds to the request)
//middleware function
app.use(morgan('dev')); // details about the api requests
app.use(express.json());
// MIDDLEWARE SERVING STATIC FILEs
//app.use(express.static(`${__dirname}/public`));

//middleware function
app.use((req, res, next) => {
  console.log('Hello from the middleware 👾');
  next(); //must include in order for it to move to next function!!
});
//middleware function

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/// ROUTES
app.use('/api/v1/tours', tourRouter); // mounting router
app.use('/api/v1/users', userRouter); // mounting router

module.exports = app;

////////// ROUTING  /////////
//inside event loop
//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTour);
//app.post('/api/v1/tours', createTour);
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

/////////////////////////////
// //Route
// app.get('/', (req, res) => {
//   //http request method
//   // request and response methods
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });
