const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
// top level code - runs at the start

//  GLOBAL MIDDLEWARES  - modify incoming request data (adds to the request)

//Set security HTTP headers
app.use(helmet()); // sets headers

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // details about the api requests
}
// Implement Rate Limiting - to help prevent DOS (denial of service) and brute force attacks (guessing password with brute force)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitizatin against NoSQL query injection
app.use(mongoSanitize()); // removes the $ and dots from query to prevent attacks using mongoDB opertors

// Data sanitization against XSS (cross site scripting attacks) e.g converts html tags to their symbol references
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving Static Files
app.use(express.static(`${__dirname}/public`)); // MIDDLEWARE SERVING STATIC FILEs

// Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);

  next();
});

/// ROUTES
app.use('/api/v1/tours', tourRouter); // mounting router
app.use('/api/v1/users', userRouter); // mounting router
app.use('/api/v1/reviews', reviewRouter); // mounting router calls reviewRouter middleware

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
