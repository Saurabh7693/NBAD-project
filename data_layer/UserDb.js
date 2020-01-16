const user = require('../model/User').user;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: {
      type: Number
    },
    firstName: String,
    lastName: String,
    emailId: String,
    address1: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    password: String
  },{collection:'users'});

const usersModel = mongoose.model('usersModel', userSchema);

class UserDb {

    constructor() {
        this.userList = [];
        this.userList.push(user(1, 'Sherlock', 'Holmes', 'sh@j.com', '123 Bakers Field', 'London', 'London', 'UK'));
        this.userList.push(user(2, 'Jhon', 'Watson', 'jw@j.com', '123 Bakers Field', 'London', 'London', 'UK'));
    };

    getRandomInt() {
      const min = Math.ceil(1);
      const max = Math.floor(100);
      return Math.floor(Math.random() * (max - min)) + min;
    };

    async getUsers() {
      this.userList = await usersModel.find({},(err, userList)=>{
          console.log('total users length', userList.length);
          return (userList);    
        });
      console.log('1st user is', this.userList[0].firstName);
      return this.userList;
    };

    async getUser(emailId) {
      console.log('In getUser db call');
      return( await usersModel.findOne({"emailId": emailId},(err, user)=>{
        // console.log('User data is', user);
        return (user);    
        })
      );
    };

    async addUser(data){
      console.log('Adding new user in db!');
      //generate Userid
      const count = await usersModel.find().count();
      console.log(`current count ${count}`);
      const newUser = new usersModel({
        userId: count + this.getRandomInt(),
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.email,
        address1: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        password: data.password
      });
      console.log(`newUser is ${newUser}`);

      await newUser.save(function (err, user) {
        if (err) return console.error(err);
        console.log(user.firstName + " saved to users collection.");
      });
    }

}
// export default UserDb;
module.exports = UserDb;