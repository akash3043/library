var Genre = require('../models/genre');
var async = require('async');
var Book = require('../models/book')

// Display list of all Genre
exports.genre_list = function(req, res, next) {
  Genre.find({})
  .sort({name:'ascending'})
  .exec((err, result)=>{
    if(err)
      return next(err)
    else {
      res.render('Genre_list', {title:'Genre List',genres:result})
    }
  })
};

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {
  async.parallel({

    genre:(callback)=>{

      Genre.findById(req.params.id,callback)
    },

    books_by_genre : (callback)=>{

    Book.find({genre:{$in:req.params.id}},callback)

  }

  }, (err,result)=>{

    console.log(result)

    if(err)
      return next(err);
    else {
      res.render('genre_detail',{data:result})
    }
  })

};

// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', {title:'Create Form'})
};

// Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {
    req.checkBody('name', 'Genre name required').notEmpty();
    req.sanitize('name').escape().trim();
    var errors = req.validationErrors();

    var genre = new Genre({

      name: req.body.name
    })

    if(errors){

      res.render('genre_form', {title:'Create Form',errors:errors})
      return;
    }else {

      Genre.findOne({name:req.body.name})
      .exec((err, result)=>{
             if(err){

               return next(err);
             }

             if(result){

               res.redirect(result.url);
             }else{

                genre.save((err)=>{

                  if(err){
                    return next(err)
                  }

                  res.redirect(genre.url);
                })
             }

      })
    }




};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {

    async.parallel({
      books: (callback)=>{Book.find({genre:req.params.id})
      .exec(callback)},

      genre: (callback)=>{
        Genre.findById(req.params.id, callback)
      }
    }, (err, results)=>{

      if(err) return next(err)
      res.render('genre_delete', {books:results.books,genre:results.genre})
    })
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {
    Genre.findByIdAndRemove(req.body.genre,(err)=>{

      if(err) return next(err)
      res.redirect('/catalog/genres')
    })
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {

    Genre.findById(req.params.id)
    .exec((err, results)=>{

      if(err) return next(err)

      res.render('genre_update', {title:'Update Genre', genre:results})

    })


};

// Handle Genre update on POST
exports.genre_update_post = function(req, res, next) {

  req.checkBody('name', 'Genre name required').notEmpty();
  req.sanitize('name').escape().trim();
  var errors = req.validationErrors();

  var genre = new Genre({

    name: req.body.name
  })

  if(errors){

    Genre.findById(req.params.id)
    .exec((err, results)=>{

      if(err) return next(err);
      res.render('genre_form', {title:'Update Form Form',errors:errors, genre:results})

    })


  }else {

    Genre.findByIdAndUpdate(req.params.id, {name: req.body.name}, (err)=>{

      if(err) return next(err)
      res.redirect('/catalog/genre/'+req.params.id)
    })


  }



};
