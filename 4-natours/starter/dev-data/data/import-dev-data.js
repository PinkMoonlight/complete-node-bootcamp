const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8') // array of javascript objects
);

// IMPORT DATA INTO DATABASE

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data sucessfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL THE DATA FROM COLLECTION/DB
const deleteData = async () => {
  try {
    await Tour.deleteMany(); // will delete all the documents in the collection when no argument passed in
    console.log('Data sucessfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//console.log(process.argv);
