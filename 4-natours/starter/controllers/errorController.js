const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// const handleDuplicateFieldsDB = (err) => {
//   const message = `Duplicate field value: x. Please use another value.`;
// };

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't want to leak error details to client
  } else {
    // 1) Log Error
    console.error('Error 🧨', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // by inputing 4 paramaters, Express automatically knows this is a error handling middlware function
  console.error(err.statusCode);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { name: err.name, message: err.message, ...err };
    //let error = { name: err.name, message: err.message };
    //error = Object.assign(error, err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    //if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};
