const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connectionDb = require('./connectionDB');

const userConnectionSchema = new Schema({
    userId: {
        type: Number,
        required: [true]
    },
    connection: {
        connectionID: {
            type: String,
            required: [true]
          },
        connectionName: String,
        topic: String,
        details: String,
        datetime: String
    },
    rsvp: {
        type: String,
        required: [true]
    }
  },{collection:'userConnection'});

const userConnectionModel = mongoose.model('userConnectionModel', userConnectionSchema);

class UserConnection {

    constructor(userId){
        this.userId = parseInt(userId, 10);
        console.log('New userConnection object created for user', this.userId);
    };

    async getUserProfile(){
        console.log(`\n !!!In getUserProfile!!!`);
        console.log(`User id is ${this.userId}`, typeof(this.userId));
        const connections = await userConnectionModel.find({"userId": this.userId},(err, connectionProfile)=>{
            console.log('number of connections are', connectionProfile.length);
            connectionProfile[0] ? console.log('1st connection', connectionProfile[0].connection.topic) : console.log(`No connections for this user`);
            return (connectionProfile);
        });
        return connections;
    };

    async addRSVP(connectionId, rsvp){
        console.log('!!!In addRSVP!!!');
        const connection = await connectionDb.getConnection(connectionId);
        console.log(`connectionId is ${connection.connectionId}`);
        const newUserConnection = new userConnectionModel({
            userId: this.userId,
            connection:{
                connectionID: connection.connectionID,
                connectionName: connection.connectionName,
                topic: connection.topic,
                details: connection.details,
                datetime: connection.datetime     
            },
            rsvp: rsvp
        });

        const doc = await newUserConnection.save();
        console.log(`doc ${doc}`);
    };

    async updateRSVP(connectionId, rsvp){
        console.log(`\nIn updateRSVP. New value is ${rsvp}`);
        const updatedDoc = await userConnectionModel.findOneAndUpdate(
            {"connection.connectionID": connectionId, "userId": this.userId},
            {$set:{"rsvp": rsvp}},
            {new: true});
        console.log(`Updated ${updatedDoc}`);
    };

    async updateConnection(connection){
        console.log(`\nIn updateConnection. New value is ${connection.connectionID}`);
        const updatedDoc = await userConnectionModel.findOneAndUpdate(
            {"connection.connectionID": connection.connectionID, "userId": this.userId},
            {$set:{"connection": connection}},
            {new: true});
        console.log(`Updated ${updatedDoc}`);
    };    

    async deleteOne(connectionId){
        console.log(`\n In deleteOne for db..User is ${this.userId} and connection is ${connectionId}`);
        const deleted = await userConnectionModel.remove({"connection.connectionID": connectionId, "userId": this.userId});
        console.log(`Deleted is ${deleted}`);
    };

    async deleteAll(connectionId){
        console.log(`\n In deleteAll for db..User is ${this.userId}`);
        const deleted = await userConnectionModel.remove({"connection.connectionID": connectionId});
        console.log(`Deleted is ${deleted}`);
    };
};

module.exports = UserConnection;