var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GenreInstance = Schema({

    name:{type:String,required:true, max:100, min:3}

})

GenreInstance
.virtual('url')
.get(function(){

  return '/catalog/genre/'+this._id
});

module.exports = mongoose.model('Genre',GenreInstance);
