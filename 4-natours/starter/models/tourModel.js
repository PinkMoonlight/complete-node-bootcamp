const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //validator
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have 40 or less characters'],
      minlength: [10, 'A tour name must have 10 or more characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour should have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either; easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A price must have a price'],
    },
    priceDiscount: {
      // custom validator
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' only points to current doc on NEW document creation
          return val < this.price; // if discount 100 < price 200 = true
        },
        message: 'Discount price ({VALUE}) should be below regualr price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // An array data model with string data fields

    createdAt: {
      // time stamp automatically created
      type: Date,
      default: Date.now(),
      select: false, // hides field from output, (can't be  requested in query results)
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    // so shows up in document results
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Virtual Property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//mongoose DOCUMENT middleware(or hook): runs BEFORE .save() cammand and .create() (not on the .insertMany())
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE uses the find hook points to current query not current document like above (document middleware)
tourSchema.pre(/^find/, function (next) {
  // regExp to get all the query middlware starting with 'find'
  //tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } }); // 'this' is query object
  this.start = Date.now();
  next();
});

// runs after the query has executed
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDlEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // adds match state to start of aggregation pipeline array

  console.log(this.pipeline()); // 'this' points to current aggregation object

  next();
});

//Model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
