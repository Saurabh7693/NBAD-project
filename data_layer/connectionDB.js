// import connection from 'connection';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
  connectionID: {
    type: String,
    required: [true]
  },
  userId: {
    type: Number,
    required: [true]
  },
  connectionName: String,
  topic: String,
  details: String,
  datetime: String
},{collection:'connection'});

const connectionModel = mongoose.model('connectionModel', connectionSchema);

exports.getConnections = async ()=>{
  const connection_list = await connectionModel.find({},(err, connection_list)=>{
    console.log('all connections length', connection_list.length);
    return (connection_list);    
  });
  return (connection_list);
};

exports.getConnection = async (id)=>{
  const connection = await connectionModel.findOne({"connectionID": id}, (err, connection)=>{
    console.log('In getConnection...connection name is', connection.connectionName);    
    return (connection);
  });
  if (connection.length <=0 ){
    return(-1)
  }
  return (connection);
};

exports.getConnectionsByUser = async (userId)=>{
  console.log(`In getConnectionsByUser...Userid is ${parseInt(userId, 10)}`);
  const connection_list = await connectionModel.find({"userId": parseInt(userId, 10)},(err, connection_list)=>{
    console.log('all connections length', connection_list.length);
    return (connection_list);
  });
  return (connection_list);
};

exports.updateConnection = async (userId, data)=>{
  console.log(`In update Connection for db`);
  data.Topic = data.Topic == 1 ? 'Learn together' : 'Practice and Jam sessions';
  console.log(`connection id is ${data.connectionID} and userid is ${userId}`);
  const res = await connectionModel.update({"connectionID": data.connectionID}, {
    connectionID: data.connectionID,
    userId: userId,
    connectionName: data.Name,
    topic: data.Topic,
    details: data.Details,
    datetime: data.Where + " ," + data.when
  });
  console.log('update op is', res);
};

exports.addConnection = async (connection)=>{
  console.log(`In add Connection for db`);
  const newConnection = new connectionModel({
    connectionID: connection.connectionID,
    userId: connection.userId,
    connectionName: connection.connectionName,
    topic: connection.topic,
    details: connection.details,
    datetime: connection.datetime
  });
  const saveddoc = await newConnection.save();
  console.log(`doc ${saveddoc}`);  
};

exports.deleteConnection = async (connectionID)=>{
  console.log(`In delete Connection for db`);
  const res = await connectionModel.remove({"connectionID": connectionID});
  console.log(`deleted count is `, res.deletedCount);
  const deleteFromUserConnection = await connectionModel.remove({"connectionID": connectionID});
}
