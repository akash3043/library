var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookInstanceSchema = Schema({
  book: { type: Schema.ObjectId, ref: 'Book', required: true }, //reference to the associated book
  imprint: {type: String, required: true},
  status: {type: String, required: true, enum:['Available', 'Maintenance', 'Loaned', 'Reserved'], default:'Maintenance'},
  due_back: { type: Date, default: Date.now },
});

// Virtual for this bookinstance object's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema
.virtual('due_date')
.get(function(){

  return moment(this.due_back).format('MMMM, DD, YYYY');
})

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
