var BookInstance = require('../models/bookinstance');
var Book = require('../models/book')
var async = require('async')

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find({})
    .populate('book')
    .exec((err,result)=>{

      if(err){
         return next(err);
      }else{

        res.render('bookinstance_list', {title:'Copies available in the library', data:result})
      }
    })
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err,result)=>{

        if(err)
          return next(err)
        else {
            res.render('bookinstance_detail',{book_instance:result})
        }
    })
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({})
    .exec((err, results)=>{
      if(err){
        return next(err)
      }else {
        res.render('bookinstance_form', {title:'Create a book instance', books:results})
      }
    })
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = function(req, res, next) {
    req.checkBody('book').notEmpty();
    req.checkBody('imprint').notEmpty();
    req.checkBody('due_back').optional({checkFalsy:true}).isDate();
    req.checkBody('status').notEmpty();

    req.sanitize('book').escape().trim();
    req.sanitize('imprint').escape().trim();
    req.sanitize('due_back').toDate();
    req.sanitize('status').escape().trim();

    var errors = req.validationErrors();

    var bookInstance = new BookInstance({

      book:req.body.book,
      imprint:req.body.imprint,
      due_back:req.body.due_back,
      status:req.body.status
    })

    if(errors){

      Book.find({})
      .exec((err, results)=>{

        if(err) return next(err)
        else {
          res.render('bookinstance_form', {title:'Create a book instance', books:results, bookInstance:bookInstance, errors:errors })
        }
      })




    }else{

        bookInstance.save((err)=>{

          if(err) return next(err);
          res.redirect(bookInstance.url);
        })
    }

};

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, result)=>{

        if(err) return next(err)

        res.render('bookinstance_delete', {bookInstance:result})

    })
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, next) {

    BookInstance.findByIdAndRemove(req.body.bookInstanceId, (err)=>{

      if(err) return next(err)
      res.redirect('/catalog/bookinstances')
    })
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {

  async.parallel({

    books :(callback)=>{

      Book.find({})
      .exec(callback)


  },

  bookInstance : (callback)=>{

    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(callback);
  }
}, (err, result)=>{

  console.log(result)

  if(err) return next(err)
  res.render('bookinstance_update',{title:'Update Instance', books:result.books, bookInstance:result.bookInstance})
})

};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res, next) {
    BookInstance.findByIdAndUpdate(req.params.id, {book:req.body.book,
    imprint:req.body.imprint,
    due_back:req.body.due_back,
    status:req.body.status}, (err)=>{
      if(err) return next(err)
      res.redirect('/catalog/bookinstance/'+req.params.id)
    })
};
