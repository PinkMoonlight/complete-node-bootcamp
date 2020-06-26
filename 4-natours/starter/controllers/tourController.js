const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

/*
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

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

exports.aliasTopTours = (req, res, next) => {
  // prefilling/ setting these query object fields
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      mssage: err,
    });
  }
};

exports.getTour = async (req, res) => {
  //console.log(req.params); //paramaters of request method - ie :id/:x/:y? (the ? means not required/optional and will return undefinded)
  //const id = req.params.id * 1; //converts string to number
  //const tour = tours.find((el) => el.id === id);
  try {
    const tour = await Tour.findById(req.params.id);
    // above is shorthand for Tour.findOne({ _id: req.params.id}) filter object and value we want to search for
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid request or ID',
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({})
  // newTour.save()
  // OR

  //using Tour model directly with the create method- returns a promise
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      //201 'created' status code
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      //204 status means no content
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.geMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          // to select docuemnts
          $startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
//
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
