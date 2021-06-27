var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars')
const messageBird = require('messagebird')('IdBrUpWPx2kK0lllgqOKVlrrU')

const server = require('http').Server(app)
const io = require('socket.io')(server)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.urlencoded({extended : true}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.get('/',(req,res)=>{
  res.render('step1')
})

app.post('/step2',(req,res)=>{
  var number = req.body.number;
  messageBird.verify.create(number,{
      template : 'Your verification code is %token.'
  },function(err,response){
      if(err){
          console.log(err);
          res.render('step1',{
              error:err.errors[0].description
          })
      }else{
          console.log(response)
          res.render('step2',{
              id:response.id
          })
      }
  })
})
app.post('/step3',(req,res)=>{
  var id = req.body.id
  var token = req.body.token

  messageBird.verify.verify(id,token,(err,response)=>{
      if(err){
          res.render('step2',{
              error:err.errors[0].description,
              id:id
          })
      }else{
          res.render('step3')
      }
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection',(socket)=>{
  socket.on('message',(msg)=>{
      console.log(msg)
      socket.broadcast.emit('message',msg)
  })
})

module.exports = app;
