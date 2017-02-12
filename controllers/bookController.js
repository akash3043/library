var Book = require('../models/book');
var Author = require('../models/author');
var Bookinstance = require('../models/bookinstance');
var Genre = require('../models/genre');

var async = require('async')

exports.index = function(req, res, next) {

    async.parallel({
      book_count : (callback)=>{

        Book.count(callback)
      },
      book_instance_count : (callback)=>{

        Bookinstance.count(callback)
      },

      book_instance_available_count : (callback)=>{

        Bookinstance.count({status:'Available'}, callback)
      },

      author_count:(callback)=>{

        Author.count(callback)
      },
      genre_count :(callback)=>{

        Genre.count(callback)
      }
    }, (err, results)=>{

      res.render('index', {title:'Local Library Home', error:err,data:results})

    })
};

// Display list of all books
exports.book_list = function(req, res, next) {
    Book.find({})
    .populate('author')
    .exec((err,result)=>{



      if(err)
        return next(err)
      else{



        res.render('book_list', {title:'Book List',book_list:result})
      }

    })
};

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {
    async.parallel({
        book_detail:(callback)=>{

            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback)
        },

        instance_detail : (callback)=>{

            Bookinstance.find({book:{$in : req.params.id}})
            .populate('book')
            .exec(callback)
        }



    },(err,result)=>{

      if(err)
        return next(err)
      else {
        res.render('book_detail',{data:result})
      }
    })


}
// Display book create form on GET
exports.book_create_get = function(req, res, next) {

    async.parallel({

        authors:(callback)=>{Author.find({}, callback)},
        genres: (callback)=>{Genre.find({}, callback)}
    },(err, results)=>{

        if(err){
          return next(err);
        }else {

          res.render('book_form', {title:'Book Form', authors:results.authors,genres:results.genres})
        }
    })
};

// Handle book create on POST
exports.book_create_post = function(req, res, next) {
  req.checkBody('title', 'Title must not be empty.').notEmpty();
 req.checkBody('author', 'Author must not be empty').notEmpty();
 req.checkBody('summary', 'Summary must not be empty').notEmpty();
 req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

 req.sanitize('title').escape().trim();
 req.sanitize('author').escape().trim();
 req.sanitize('summary').escape().trim();
 req.sanitize('isbn').escape().trim();
 req.sanitize('genre').escape();

 var book = new Book(
   { title: req.body.title,
     author: req.body.author,
     summary: req.body.summary,
     isbn: req.body.isbn,
     genre: req.body.genre
    });

 console.log('BOOK: '+book);

 var errors = req.validationErrors();
 if (errors) {
     // Some problems so we need to re-render our book

     //Get all authors and genres for form
     async.parallel({
         authors: function(callback) {
             Author.find(callback);
         },
         genres: function(callback) {
             Genre.find(callback);
         },
     }, function(err, results) {
         if (err) { return next(err); }

         // Mark our selected genres as checked
         for (i = 0; i < results.genres.length; i++) {
             if (book.genre===results.genres[i]) {
                 //Current genre is selected. Set "checked" flag.
                 results.genres[i].checked='true';
             }
         }

         res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors:errors});
     });

 }
 else {
 // Data from form is valid.
 // We could check if book exists already, but lets just save.

     book.save(function (err) {
         if (err) { return next(err); }
            //successful - redirect to new book record.
            res.redirect(book.url);
         });
 }

};


// Display book delete form on GET
exports.book_delete_get = function(req, res, next) {
  async.parallel({
    book_instances: (callback)=>{Bookinstance.find({book:req.params.id})
    .exec(callback)},

    book: (callback)=>{
      Book.findById(req.params.id, callback)
    }
  }, (err, results)=>{

    if(err) return next(err)
    res.render('book_delete', {book_instances:results.book_instances,book:results.book})
  })
};

// Handle book delete on POST
exports.book_delete_post = function(req, res, next) {
  Book.findByIdAndRemove(req.body.book,(err)=>{

    if(err) return next(err)
    res.redirect('/catalog/books')
  })
};

// Display book update form on GET
exports.book_update_get = function(req, res, next) {

  async.parallel({
      authors: function(callback) {
          Author.find(callback);
      },
      genres: function(callback) {
          Genre.find(callback);
      },
      book:function(callback){

        Book.findById(req.params.id)
        .populate('genre')
        .populate('author')
        .exec(callback)
      }
  }, function(err, results) {
      if (err) { return next(err); }

      // Mark our selected genres as checked

      res.render('book_update', { title: 'Update Book',authors:results.authors, genres:results.genres, book: results.book });
  });


};

// Handle book update on POST
exports.book_update_post = function(req, res, next) {

  req.checkBody('title', 'Title must not be empty.').notEmpty();
 req.checkBody('author', 'Author must not be empty').notEmpty();
 req.checkBody('summary', 'Summary must not be empty').notEmpty();
 req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

 req.sanitize('title').escape().trim();
 req.sanitize('author').escape().trim();
 req.sanitize('summary').escape().trim();
 req.sanitize('isbn').escape().trim();
 req.sanitize('genre').escape();

console.log(req.params.id);




 var errors = req.validationErrors();
 if (errors) {
     // Some problems so we need to re-render our book

     //Get all authors and genres for form
     async.parallel({
         authors: function(callback) {
             Author.find(callback);
         },
         genres: function(callback) {
             Genre.find(callback);
         },

         book:function(callback) {

           Book.findById(req.params.id,callback)
         }
     }, function(err, results) {
         if (err) { return next(err); }

         // Mark our selected genres as checked

         res.render('book_update', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors:errors});
     });

 }
 else {
 // Data from form is valid.
 // We could check if book exists already, but lets just save.

     Book.findByIdAndUpdate(req.params.id,{$set:{title: req.body.title,
       author: req.body.author,
       summary: req.body.summary,
       isbn: req.body.isbn,
       genre: req.body.genre}},function (err) {
         if (err) { return next(err); }


            //successful - redirect to new book record.
            res.redirect('/catalog/book/'+req.params.id);
         });
 }

};
