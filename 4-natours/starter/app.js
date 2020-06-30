const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// top level code - runs at the start

//  MIDDLEWARES  - modify incoming request data (adds to the request)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // details about the api requests
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // MIDDLEWARE SERVING STATIC FILEs

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/// ROUTES
app.use('/api/v1/tours', tourRouter); // mounting router
app.use('/api/v1/users', userRouter); // mounting router

// to catch any url paths that aren't handled above or don't exist
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // passing something into next() makes espress assume and execute as an error and skip other middlwares
}); // runs for all http methods

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

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
