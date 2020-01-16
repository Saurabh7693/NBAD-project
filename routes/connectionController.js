const express = require('express');
const router = express.Router();
const connectionDB = require('../data_layer/connectionDB');
const connectionModel = require('../model/connection');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const userConnectionDB = require('../data_layer/userConnectionDB');
const { check,  validationResult } = require('express-validator');

router.get('/createdConnections', async(req, res)=>{
  console.log(`\n Get created Connection hit.`);
  console.log('user is', req.session.theUser.firstName);
  if (req.session.theUser){
    const connection_list = await connectionDB.getConnectionsByUser(req.session.theUser.userId);
    req.session.createdConnections = connection_list;
    res.render('createdConnections', {connectionDetails: connection_list, userDetails: req.session.theUser});
  }
  else res.redirect('/');
});

router.get('/updateConnection', async(req, res)=>{
  console.log(`\n Get updateConnection hit!!.`);
  console.log('user is', req.session.theUser.firstName);
  console.log('connectionID', (req.query.connectionID));
  if (req.session.theUser){
    req.session.createdConnections.forEach(element => {
      if(element.connectionID == req.query.connectionID) {
        res.render('updateConnection', {userDetails: req.session.theUser, connectionDetails: element});
      }
    });
    res.render('createdConnections', {connectionDetails: req.session.createdConnections, userDetails: req.session.theUser});    
  }
  else res.redirect('/');
});

router.post('/updateConnection', urlencodedParser, 
[
  // check connection name
  check('Name').isLength({ min: 5 }).withMessage('Connection name must be an atleast 5 characters'),
  // check password must be atleast 5 characters
  check('Details').isLength({ min: 5 }).withMessage('Connection description must be an atleast 5 characters'),
  check('Where').isLength({ min: 5 }).withMessage('Connection location must be an atleast 5 characters'),
  check('when').isAfter('2019-12-10').withMessage('Date must be greater than current date')
],
async(req, res)=>{
  console.log(`\nPost updateConnection hit!!.`);
  console.log('user is', req.session.theUser.firstName);
  console.log('data received', (req.body));

  //validation check
  const errors = validationResult(req);
  validationErrorsArray = errors.array();
  if (!errors.isEmpty()) {
    console.log(`validation error:`, validationErrorsArray[0].msg);
    req.session.createdConnections.forEach(element => {
      if(element.connectionID == req.body.connectionID) {
        res.render('updateConnection', {userDetails: req.session.theUser, connectionDetails: element, validationError: validationErrorsArray[0].msg});
      }
    });
  }
  else{
    if (req.session.theUser){
      //update connection collection
      await connectionDB.updateConnection(req.session.theUser.userId, req.body);

      //update userConnection collection      
      const connectiondata = connectionModel.connection(req.body.connectionID, req.body.Name, req.body.Topic, req.body.Details, req.body.Where + " ," + req.body.when, req.session.theUser.userId);
      userConnectionObject = new userConnectionDB(req.session.theUser.userId);
      console.log('new connection is ', connectiondata);
      await userConnectionObject.updateConnection(connectiondata);

      //update session
      req.session.userConnections.connectionsList.forEach(element => {
        if (element.connection.connectionID == req.body.connectionID) {
          console.log(`element found. id is ${element.connection.connectionID}`);
          element.connection = connectiondata;
        };
      });
      res.redirect('/connection/createdConnections');
    };  
  };
});


router.post('/deleteConnection', urlencodedParser, async(req, res)=>{
  console.log(`\nPost deleteConnection hit!!.`);
  console.log('user is', req.session.theUser.firstName);
  console.log('connectionID', (req.body.connectionID));
  if (req.session.theUser){
    //remove from connection collection
    connection_list = await connectionDB.deleteConnection(req.body.connectionID);

    //remove from userConnection
    userConnectionObject = new userConnectionDB(req.session.theUser.userId);
    await userConnectionObject.deleteAll(req.body.connectionID);

    //remove from session
    console.log(`userconnections are ${req.session.userConnections.connectionsList[0].connection.connectionID}`);
    const newList = req.session.userConnections.connectionsList.filter(element => {
      if (element.connection.connectionID != req.body.connectionID) {
        return element;
      };
    });
    req.session.userConnections.connectionsList = newList;
    res.redirect('/connection/createdConnections');
  }
  else res.redirect('/');
});

router.get('/:connectionID', async (req, res)=>{
  console.log(`\n Connection hit`);
  console.log(req.params);
  if (req.params.connectionID){
    let checkval = (req.params.connectionID.slice(0,3));
    if (checkval != 'BAS' && checkval != 'JAM'){
      console.log(`connectionID not valid ${req.params.connectionID} ${checkval}`);
      connection_list = await connectionDB.getConnections();
      res.render('connections', {connection_list: connection_list, userDetails: req.session.theUser});
    }
    else {
      connection = await connectionDB.getConnection(req.params.connectionID);
      console.log(`connection is ${connection.connectionID}`);
      res.render('connection', {connection: connection, userDetails: req.session.theUser});
    }
  }
  else{
    console.log(`\n Connection hit no connectionID found`);    
    connection_list = connectionDB.getConnections();
    console.log('Connection 1 topic', connection_list[0].topic);    
    res.render('connections', {connectionDetails: connection_list, userDetails: req.session.theUser});
  }
});

router.get('/', async (req, res)=>{
  console.log(`\n Connection hit. no connectionID found`);
  connection_list = await connectionDB.getConnections();
  console.log('Connection 1 topic', connection_list[0].topic);
  res.render('connections', {connection_list: connection_list, userDetails: req.session.theUser});
});

module.exports = router;
