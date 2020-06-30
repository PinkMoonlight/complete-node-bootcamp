class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // all the key values pairs in the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|ge|lte|lt)\b/g, (match) => `$${match}`); // filter object: { difficulty: 'easy', duration: { $gte: 5 } }

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // sort('price ratingsAverage') needs to replace the space with a ,

      this.query = this.query.sort(sortBy); // mongoose method will sort it by the query request/property
    } else {
      this.query = this.query.sort('-createdAt'); // the '-' means desending order
    }
    return this;
  }

  limitFields() {
    // 3) Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // mongoose method that will just return the specific requested fields in  query
    } else {
      this.query = this.query.select('-__v'); //excluding the --v field
    }
    return this;
  }

  paginate() {
    // 4) Pagination
    const page = this.queryString.page * 1 || 1; // converts string to a number
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page=2&limit=10, 1-10 = page 1, 11-20 = page 2, 21-30 = page 3 // skip is equal to how many results to skip over to get to page
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
