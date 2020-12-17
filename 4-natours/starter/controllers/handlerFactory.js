const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// DELETE
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      //204 status means no content
      status: 'success',
      data: null,
    });
  });

// UPDATE
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// CREATE
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //using model directly with the create method- returns a promise
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      //201 'created' status code
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

// GET ONE
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //console.log(req.params); //paramaters of request method - ie :id/:x/:y? (the ? means not required/optional and will return undefinded)

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// GET ALL
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested get Reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    //  const doc = await features.query.explain();

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
