var Author = require('../models/author');
var Book = require('../models/book')
var async = require('async');
// Display list of all Authors
exports.author_list = function(req, res, next) {

    Author.find({})
    .sort({family_name:'ascending'})
    .exec((err, result)=>{
      if(err)
        return next(err)
      else {
        res.render('author_list', {title:'Author List',authors:result})
      }
    })
};

// Display detail page for a specific Author
exports.author_detail = function(req, res, next) {

  async.parallel({

    author:(callback)=>{

      Author.findById(req.params.id,callback)
    },

    books_by_author : (callback)=>{

    Book.find({author:{$in:req.params.id}},callback)

  }

  }, (err,result)=>{

    if(err)
      return next(err);
    else {
      res.render('author_detail',{data:result})
    }
  })

};

// Display Author create form on GET
exports.author_create_get = function(req, res, next) {
    res.render('author_form', {title:'Create Author'})
};

// Handle Author create on POST
exports.author_create_post = function(req, res, next) {
    req.checkBody('first_name', 'First name not enteres').notEmpty();
    req.checkBody('family_name', 'Family name not enteres').notEmpty();
    req.checkBody('first_name', 'Family name not enteres').isAlpha();
    req.checkBody('date_of_birth', 'Enter the date of birth in proper format').optional({checkFalsy:true}).isDate();
    req.checkBody('date_of_death', 'Enter the date of death in proper format').optional({checkFalsy:true}).isDate();

    req.sanitize('first_name').escape().trim();
    req.sanitize('family_name').escape().trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    var errors = req.validationErrors();

    var author = Author({

        first_name : req.body.first_name,
        family_name:req.body.family_name,
        date_of_birth:req.body.date_of_birth,
        date_of_death:req.body.date_of_death,
    })

    if(errors){

      res.render('author_form', {title:'Create Author', errors:error, author:author});
      return;
    }else{

    author.save((err)=>{

      if(err){

        return next(err);
      }else{

        res.redirect(author.url);
      }

    })

  }



};

// Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {

    async.parallel({

      author:(callback)=>{

          Author.findById(req.params.id).exec(callback)
      },

      author_books : (callback)=>{

        Book.find({author:req.params.id}).exec(callback);
      }
    }, (err, results)=>{

      if(err) return next(err);
      else {
        res.render('author_delete',{title:'Delete Author', author:results.author,author_books:results.author_books})
      }
    })
};

// Handle Author delete on POST
exports.author_delete_post = function(req, res, next) {
    Author.findByIdAndRemove(req.body.authorId,(err)=>{
        if(err) return next(err);
        res.redirect('/catalog/authors')
    })
};

// Display Author update form on GET
exports.author_update_get = function(req, res, next) {
  Author.findById(req.params.id)
  .exec((err, results)=>{

    if(err) return next(err)

    res.render('author_form', {title:'Update Author', author:results})

  })

};

// Handle Author update on POST
exports.author_update_post = function(req, res, next) {
  req.checkBody('first_name', 'First name not enteres').notEmpty();
  req.checkBody('family_name', 'Family name not enteres').notEmpty();
  req.checkBody('first_name', 'Family name not enteres').isAlpha();
  req.checkBody('date_of_birth', 'Enter the date of birth in proper format').optional({checkFalsy:true}).isDate();
  req.checkBody('date_of_death', 'Enter the date of death in proper format').optional({checkFalsy:true}).isDate();

  req.sanitize('first_name').escape().trim();
  req.sanitize('family_name').escape().trim();
  req.sanitize('date_of_birth').toDate();
  req.sanitize('date_of_death').toDate();

  var errors = req.validationErrors();

  if(errors){

    Author.findById(req.params.id)
    .exec((err, results)=>{

      if(err) return next(err)
      res.render('author_form', {title:'Create Author', errors:errors, author:results});

    })


  }else{

    Author.findByIdAndUpdate(req.params.id, {first_name : req.body.first_name,
    family_name:req.body.family_name,
    date_of_birth:req.body.date_of_birth,
    date_of_death:req.body.date_of_death}, (err)=>{

      if(err) return next(err) ;
      res.redirect('/catalog/author/'+req.params.id)


    })




}

};
