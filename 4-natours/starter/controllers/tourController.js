const Tour = require('../models/tourModel');

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

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    //1A) Filtering
    const queryObj = { ...req.query }; //all the key values pairs in the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //console.log(req.query, queryObj);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|ge|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(JSON.parse(queryStr));
    // fiter object: { difficulty: 'easy', duration: { $gte: 5 } }

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy); //mongoose method will sort it by the query request/property
      // sort('price ratingsAverage') needs to replace the space with a ,
    }

    // const query =  Tour.find();
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // EXECUTE QUERY
    const tours = await query;

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
