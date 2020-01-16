const express = require('express');
const app = express();
//const router = express.Router();
const connections = require('./routes/connectionController.js');
const profile = require('./routes/profileController');
const session = require('express-session');
const mongodb = require('./data_layer/dbConnect.js');

mongodb();

app.set('view engine', 'ejs');

app.use('/resources', express.static('resources'));
app.use('/connection/resources', express.static('resources'));
app.use(session({
  secret: 'keyboard',
}));

app.get('/', (req, res)=>{
  console.log(`Index hit with url ${req.path}`);
  res.render('index', {userDetails: req.session.theUser});
});

// app.get('/savedConnections', (req, res)=>{
//   console.log(`savedConnections ${req.path}`);
//   res.render('savedConnections');
// });

app.get('/about', (req, res)=>{
  console.log(`contact ${req.path}`);
  res.render('partials/about', {userDetails: req.session.theUser});
});

app.get('/contact', (req, res)=>{
  console.log(`contact ${req.path}`);
  res.render('partials/contact', {userDetails: req.session.theUser});
});

app.use('/connection', connections);
app.use('/', profile);

app.listen(5000, ()=>{
  console.log('Listening on port 5000');
});
