var express = require('express');
var router = express.Router();
const bookRoute = require("./book");
const userRoute = require("./user.route");
const { userModel, bookModel } = require("../model");
const Book = require('../model/book');

const  {bookController} = require('../controllers');

/* GET home page. */
router.get('/', async function (req, res, next) {
  const user_count  = await userModel.count();
  const book_count = await bookModel.count();
  const genre_count = await bookModel.find().distinct("genres");

  res.render('index', { title: 'Library Management System', user_count, book_count, genre_count: genre_count.length });
});

router.get('/add-book', function(req, res, next) {
  res.render('form/add-book');
});

router.post('/add-book', async (req,res)=>{
  console.log(req.body);
  try{
    const book= await Book.create(req.body);
    
    console.log('-------Book Details--------');
    console.log(book);

    res.redirect("/book");
  }catch(e){
    console.log(e.toString());
  }
})


router.use('/book', bookRoute);
router.use("/user", userRoute);

module.exports = router;
