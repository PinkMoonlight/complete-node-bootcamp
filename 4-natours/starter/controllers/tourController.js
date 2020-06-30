const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  // prefilling/ setting these query object fields
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //console.log(req.params); //paramaters of request method - ie :id/:x/:y? (the ? means not required/optional and will return undefinded)
  //const id = req.params.id * 1; //converts string to number
  //const tour = tours.find((el) => el.id === id);

  const tour = await Tour.findById(req.params.id);
  // above is shorthand for Tour.findOne({ _id: req.params.id}) filter object and value we want to search for

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  //using Tour model directly with the create method- returns a promise
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    //201 'created' status code
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    //204 status means no content
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // Using Tour model to access the tour collection via mongoose
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // like a query/filter
    },
    {
      $group: {
        //group documents together using accumulators
        _id: { $toUpper: '$difficulty' }, // null makes it one big group
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' }, // first the operator then the fieldname
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.geMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      // separate by different start dates
      $unwind: '$startDates',
    },
    {
      $match: {
        // to select docuemnts
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: `$startDates` }, // returns num between 1 - 12 representing the month
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, //creates an array with name of the tour
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // 0 removes fieldname (_id) and 1 displays it (boolean)
      },
    },
    {
      $sort: { numTourStarts: -1 }, // -1 is decending
    },
    {
      $limit: 12, // only 12 outputs
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

//
// ALTERNATE CODE for reading data from file using fs (fileSync)
/*
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
// manual middleware to check for body.name or body.price in request. 
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing required name or price data',
    });
  }
  next();
};
*/
//
// BUILD QUERY
// // 1A) Filtering
// const queryObj = { ...req.query }; //all the key values pairs in the query object
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);
// //console.log(req.query, queryObj);

// // 1B) Advanced Filtering
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(
//   /\b(gte|ge|lte|lt)\b/g,
//   (match) => `$${match}`
// );
// // filter object: { difficulty: 'easy', duration: { $gte: 5 } }

// let query = Tour.find(JSON.parse(queryStr));

// const query =  Tour.find();
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');

// // 2) Sorting
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy); // mongoose method will sort it by the query request/property
//   // sort('price ratingsAverage') needs to replace the space with a ,
// } else {
//   query = query.sort('-createdAt'); // the '-' means desending order
// }

// // 3) Field Limiting
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields); // mongoose method that will just return the specific requested fields in  query
// } else {
//   query = query.select('-__v'); //excluding the --v field
// }

// // 4) Pagination
// const page = req.query.page * 1 || 1; // converts string to a number
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// //page=2&limit=10, 1-10 = page 1, 11-20 = page 2, 21-30 = page 3 // skip is equal to how many results to skip over to get to page
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours)
//     throw new Error('This page does not exist');
// }
