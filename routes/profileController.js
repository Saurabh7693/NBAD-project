const express = require('express');
const router = express.Router();
const UserDb = require('../data_layer/UserDb');
const UserProfile = require('../model/UserProfile');
const connectionDB = require('../data_layer/connectionDB');
const userConnectionDB = require('../data_layer/userConnectionDB');
const connectionModel = require('../model/connection');
const userModel = require('../model/User');
const { check,  validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
let userConnectionObject = "";

const createUserSession = async (req, user1 = null) =>{
    console.log('CreateUserSession function hit');
    if (user1 == null){
        //default user creation
        obj = new UserDb();
        userRes = await obj.getUsers();
        user1 = userRes[0]
        console.log(`user obtained from db is ${user1.firstName} with userid ${user1.userId}`);
        console.log(user1);
    }
    req.session.userConnections = new UserProfile(user1.userId);
    userConnectionObject = new userConnectionDB(user1.userId);
    connectionProfile = await userConnectionObject.getUserProfile();
    connectionProfile.forEach((connections)=>{
        req.session.userConnections.addConnection(connections.connection, connections.rsvp);
    });
    req.session.theUser = user1;        
    console.log('Session created');
    return user1;
};

const save = async (req) =>{
    const values = ['yes', 'no', 'Maybe'];
    console.log('In Save function');
    console.log('rsvp', req.query.rsvp);
    var flag = false;
    if (req.query.rsvp || values.includes(req.query.rsvp)){
        if (req.session.userConnections){
            //Checking if connection exists in userConnection
            for (i=0; i<req.session.userConnections.connectionsList.length; i++){
                if (req.session.userConnections.connectionsList[i].connection.connectionID == req.query.connectionId){
                    req.session.userConnections.connectionsList[i].rsvp = req.query.rsvp;
                    rsvpStatus = await userConnectionObject.updateRSVP(req.query.connectionId, req.query.rsvp);
                    flag = true;
                    break;
                };
            };
            if (flag == false){
                //Adding new connection in userConnection
                const connectionDBOutput = await connectionDB.getConnection(req.query.connectionId);
                console.log(`New connection is ${connectionDBOutput}`);
                const newConnection = connectionModel.connection(connectionDBOutput.connectionID, connectionDBOutput.connectionName, connectionDBOutput.topic, connectionDBOutput.details, connectionDBOutput.datetime, connectionDBOutput.userId);
                req.session.userConnections.connectionsList.push({connection: newConnection, rsvp: req.query.rsvp});
                await userConnectionObject.addRSVP(req.query.connectionId, req.query.rsvp);
            };
            console.log('New Profile is', req.session.userConnections);
        };
    };
};

const deleteOne = async (req) =>{
    if (req.session.userConnections){
        console.log('In delete Connection');
        for (i=0; i<req.session.userConnections.connectionsList.length; i++){
            if (req.session.userConnections.connectionsList[i].connection.connectionID == req.query.connectionId){
                req.session.userConnections.connectionsList.splice(i, 1);
                await userConnectionObject.deleteOne(req.query.connectionId);                
                break;
            };
        };
    };
};

const updateProfile = (req, res)=>{
    if (req.session.userConnections){
        flag = false;
        console.log('In Update Profile');
        for (i=0; i<req.session.userConnections.connectionsList.length; i++){
            if (req.session.userConnections.connectionsList[i].connection.connectionID == req.query.connectionId){
                res.render('connection', {connection: req.session.userConnections.connectionsList[i].connection, userDetails: req.session.theUser});
                flag = true;
                break;
            };
        };
        if (flag = false){
            res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
        };
    };
};

const addConnection = async(req, res)=>{
    console.log('Add connection function hit');
    if (req.body){
        const random = Math.floor(Math.random() * (+999 - +104)) + +104;
        let connectionId = "";
        let connectionTopic = "";        
        if (req.body.Topic == "1"){
            connectionId = "BAS" + random;
            connectionTopic = "Learn together";
        }
        else if (req.body.Topic == "2"){
            connectionId = "JAM" + random;
            connectionTopic = "Practice and Jam sessions";            
        }
        console.log(`New connectionid ${connectionId} and name ${connectionTopic}`);
        console.log(`Userid is ${req.session.userConnections.userId}`);
        const newConnection = connectionModel.connection(connectionId, req.body.Name, connectionTopic, req.body.Details, req.body.Where + " ," + req.body.when,  req.session.userConnections.userId);
        console.log(`New connection is ${newConnection.connectionID}`);
        await connectionDB.addConnection(newConnection);
        res.redirect('/connection/createdConnections');
    };
};

// Adding routes
router.get('/newConnection', async (req, res)=>{
    console.log(`\n New connection hit!!!`);
    if (!req.session.theUser){
        user1 = await createUserSession(req);
        console.log(`theUser is ${req.session.theUser.firstName}`);
        console.log(`userConnection length is ${req.session.userConnections.connectionsList.length}`);
        res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
    }
    else if (req.session.theUser){
        console.log('User present');
        res.render('newConnection', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
    }
});


router.get('/savedConnections', (req, res)=>{
    console.log(`\nIn Get Saved Connections`);
    if (!req.session.theUser){
        user1 = createUserSession(req);
        console.log(`theUser is ${req.session.theUser.firstName}`);
        console.log(`userConnection length is ${req.session.userConnections.connectionsList.length}`);
    };
    res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});    
});

router.post('/savedConnections', urlencodedParser, 
[
    // validation and sanitization
    check('Name').isLength({ min: 5 }).withMessage('Connection name must be an atleast 5 characters'),
    check('Details').isLength({ min: 5 }).withMessage('Connection description must be an atleast 5 characters'),
    check('Where').isLength({ min: 5 }).withMessage('Connection location must be an atleast 5 characters'),
    check('when').isAfter('2019-12-10').withMessage('Date must be greater than current date')
],
async (req, res)=>{
    console.log(`\nIn post of savedConn`);
    console.log('Req.body is', req.body);
    console.log('Req.action is', req.body.action);    
    if (!req.session.theUser){
        if (req.body.action && req.body.action == 'save'){
            res.render('login', {msg: 'Kindly login to rsvp for the event!'});
        }
        else res.redirect('/login');
    }
    else{
        const actions = ['save', 'delete', 'updateProfile', 'addConnection', 'signout'];
        if (!req.body.action || req.body.action == ''){
            console.log("No action found");
            res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
        }
        else if (actions.includes(req.body.action)) {
            if (req.query.connectionId){
                if (req.body.action == 'save'){
                    await save(req);
                    res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
                }
                else if (req.body.action == 'delete'){
                    deleteOne(req);
                    res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
                }
                else if (req.body.action == 'updateProfile'){
                    updateProfile(req, res);
                }
            }
            else if (req.body.action == 'addConnection'){
                const errors = validationResult(req);
                validationErrorsArray = errors.array();
                if (!errors.isEmpty()) {
                    console.log(`validation error:`, validationErrorsArray[0].msg);                
                    res.render('newConnection', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList, validationError: validationErrorsArray[0].msg});
                }
                else addConnection(req, res);
            }
        };
    };
});

router.get('/login', (req, res)=>{
    console.log('!!!Login hit!!!');
    res.render('login');
});

router.post('/login', urlencodedParser,
[
    // username must be an email
    check('username').isEmail().normalizeEmail().withMessage('Input correct email format'),
    // check password must be atleast 5 characters
    check('password').isLength({ min: 5 }).withMessage('Password must have 5 characters atleast')
],
async (req, res)=>{
    console.log('\nPost for Login hit!!!');
    console.log(req.body);
    const errors = validationResult(req);
    if (req.body.action == 'signIn'){
        if (req.session.theUser){
            res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
        }
        else {
            //validating input data
            validationErrorsArray = errors.array();
            console.log(validationErrorsArray);
            validationErrorsArray.forEach(async obj=>{
                if (!req.body.username || !req.body.password || obj.param == "username" || obj.param == "password"){
                    res.render('login', {validationError: true});
                }
            });

            //verifying input data
            console.log('Calling getUser');
            obj = new UserDb();
            userData = await obj.getUser(req.body.username);
            console.log(`userdata received is ${userData}`);
            bcrypt.compare(req.body.password, userData.password, async function(err, response) {
                if(response) {
                 // Passwords match
                 user1 = await createUserSession(req, userData);
                 console.log(`Signup success...theUser is ${req.session.theUser.firstName}`);
                 console.log(`userConnection length is ${req.session.userConnections.connectionsList.length}`);
                 res.render('savedConnections', {userDetails: req.session.theUser, connectionDetails: req.session.userConnections.connectionsList});
                } else {
                 // Passwords don't match
                 console.log(`error: ${err}`);
                 console.log(`db ${userData.password} body ${req.body.password}`);
                 res.render('login', {validationError: true});
                } 
              });
        };
    }
    else res.redirect('/');    
});

router.get('/signout', (req, res)=>{
    if (req.session){
        req.session.destroy();
        res.redirect('/');
    }
});

router.get('/signup', (req, res)=>{
    console.log('!!!Signup hit!!!');
    res.render('signup');
});

router.post('/signup', urlencodedParser, 
[
    check('firstName').isLength({min:1}).withMessage('First Name must have 1 character atleast'),
    check('lastName').isLength({min:1}).withMessage('Last Name must have 1 character atleast'),
    check('email').isEmail().normalizeEmail().withMessage('Input correct email format'),
    check('address').isLength({min:1}).withMessage('Address must have 1 character atleast'),
    check('city').isLength({min:1}).withMessage('City name invalid'),
    check('state').isLength({min:1}).withMessage('State name invalid'),
    check('zip').isNumeric().isLength({min:5}).withMessage('Invalid Zip. Must be atleast 5 digits'),
    check('country').isLength({min:1}).withMessage('Country Invalid'),
    check('password').isLength({ min: 5 }).withMessage('Password must have 5 characters atleast')
],
async(req, res)=>{
    console.log('Signup Post hit. Input data is', req.body);
    const {button, action, ...data} = req.body;

    //validating input data
    const errors = validationResult(req);
    const validationErrorsArray = errors.array();
    obj = new UserDb();
    if(validationErrorsArray && validationErrorsArray.length > 0){
        console.log('validation error', validationErrorsArray);
        res.render('signup', {validationError: validationErrorsArray[0].msg});
    };
    const checkUser = await obj.getUser(req.body.email);
    if (checkUser){
        res.render('signup', {userPresent: true});
    }
    else {
        //hash password with salt
        bcrypt.hash(data.password, 10, async function(err, hash) {
            data.password = hash;
            const userData = await obj.addUser(data);
            res.render('login', {signupSuccess: true});            
        });
    }
});

module.exports = router;
