const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 🧨 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); // 1 is code for uncaught exception
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successfull!'));

// START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Event listener: Handling any unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 🧨 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // 1 is code for uncaught exception
  });
});

/*
//document instance of the Tour model
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
});

//saves document to database and returns a promise
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR 🧨', err);
  });
*/
